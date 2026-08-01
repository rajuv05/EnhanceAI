import datetime

import logging
import os
import time
import uuid
from datetime import timedelta
from typing import List




import razorpay

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pathlib import Path


import auth

import email_util
import models
import schemas
import utils
from database import engine, get_db


print("Creating database tables...")
models.Base.metadata.create_all(bind=engine)
print("Database tables created.")
from config import settings

rzp_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
from image import image_processor
from video import video_processor


# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure upload directories exist
os.makedirs("uploads/original", exist_ok=True)
os.makedirs("uploads/enhanced", exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)



# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

# Auth Endpoints
@app.post("/api/v1/register", response_model=schemas.User)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = auth.get_password_hash(user_in.password)
        verification_token = str(uuid.uuid4())
        expiry = datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=24)
        
        db_user = models.User(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=hashed_password,
            is_active=False,
            email_verified=False,
            verification_token=verification_token,
            verification_expiry=expiry
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send email
        email_util.send_verification_email(db_user.email, verification_token)
        
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Internal server error. Check database schema.")

@app.post("/api/v1/resend-verification")
def resend_verification(email: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    verification_token = str(uuid.uuid4())
    expiry = datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=24)
    
    user.verification_token = verification_token
    user.verification_expiry = expiry
    db.commit()
    
    email_util.send_verification_email(user.email, verification_token)
    return {"msg": "Verification email sent"}

@app.get("/api/v1/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    if user.verification_expiry < datetime.datetime.now(datetime.UTC):
        raise HTTPException(status_code=400, detail="Verification token expired")
    
    user.email_verified = True
    user.is_active = True
    user.verification_token = None
    user.verification_expiry = None
    db.commit()
    
    return {"msg": "Email verified successfully"}

@app.post("/api/v1/login", response_model=schemas.Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.email_verified:
        logger.warning(f"{user.email} not verified - allowing login in development")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Media Processing Endpoints
def get_user_usage(db: Session, user_id: int):
    try:
        usage = db.query(models.UserUsage).filter(models.UserUsage.user_id == user_id).first()
        now = datetime.datetime.now(datetime.UTC)
        
        if not usage:
            usage = models.UserUsage(
                user_id=user_id, 
                count_today=0, 
                reward_credits=0, 
                reward_ads_watched=0, 
                total_count=0,
                last_reset=now
            )
            db.add(usage)
            db.commit()
            db.refresh(usage)
        
        # Ensure values are not None
        if usage.count_today is None: usage.count_today = 0
        if usage.reward_credits is None: usage.reward_credits = 0
        if usage.reward_ads_watched is None: usage.reward_ads_watched = 0
        if usage.total_count is None: usage.total_count = 0
        
        # Check if needs reset (new day)
        if usage.last_reset is None:
            usage.last_reset = now
            db.commit()
        
        # Extract dates safely for comparison
        last_reset_date = usage.last_reset.date() if hasattr(usage.last_reset, 'date') else now.date()
        if last_reset_date < now.date():
            usage.count_today = 0
            usage.reward_credits = 0
            usage.reward_ads_watched = 0
            usage.last_reset = now
            db.commit()
        
        return usage
    except Exception as e:
        logger.error(f"Error in get_user_usage: {e}")
        # Return a temporary object if DB fails to avoid crashing entire app
        return models.UserUsage(count_today=0, reward_credits=0, total_count=0)

@app.get("/api/v1/usage")
def read_usage(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        usage = get_user_usage(db, current_user.id)
        plan = current_user.subscription_plan or "free"
        base_limit = 10 if plan == "free" else 999999
        
        # Calculate totals safely
        reward_credits = usage.reward_credits or 0
        count_today = usage.count_today or 0
        
        return {
            "count_today": count_today,
            "reward_credits": reward_credits,
            "reward_ads_watched": usage.reward_ads_watched or 0,
            "total_count": usage.total_count or 0,
            "plan": plan,
            "base_limit": base_limit,
            "total_limit": base_limit + reward_credits,
            "remaining": max(0, (base_limit + reward_credits) - count_today)
        }
    except Exception as e:
        logger.error(f"Usage error: {e}")
        return {
            "count_today": 0,
            "reward_credits": 0,
            "reward_ads_watched": 0,
            "total_count": 0,
            "plan": "free",
            "base_limit": 10,
            "total_limit": 10,
            "remaining": 10
        }

@app.post("/api/v1/usage/reward")
def claim_reward(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.subscription_plan != "free":
        raise HTTPException(status_code=400, detail="Rewards only available for free users")
        
    usage = get_user_usage(db, current_user.id)
    if usage.reward_ads_watched >= 3:
        raise HTTPException(status_code=400, detail="Daily maximum of 3 rewards reached")
        
    usage.reward_ads_watched += 1
    usage.reward_credits += 5
    db.commit()
    
    return {"msg": "Reward claimed", "reward_credits": usage.reward_credits}

@app.post("/api/v1/enhance", response_model=schemas.Task)
async def create_processing_task(
    file: UploadFile = File(...),
    tool: str = Form("optimize"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_start = time.time()
    timings = {}

    # 1. Validation Logic
    plan = current_user.subscription_plan or "free"
    is_pro = (current_user.is_pro or False) or plan in ["pro", "lifetime"]
    
    # Check if user is actually active/pro via status
    if plan == "pro" and current_user.subscription_status != "active":
        is_pro = False

    # Check file size (Free: 100MB, Pro: 2GB)
    file_size_limit = 100 * 1024 * 1024 if not is_pro else 2 * 1024 * 1024 * 1024
    
    # Save upload
    t_start = time.time()
    file_path = utils.save_upload_file(file)
    timings["Save upload"] = time.time() - t_start
    
    original_size = os.path.getsize(file_path)
    
    if original_size > file_size_limit:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"File too large for your plan ({'100MB' if not is_pro else '2GB'} limit)")

    # Check daily usage for free users
    if not is_pro:
        usage = get_user_usage(db, current_user.id)
        if usage.count_today >= (10 + usage.reward_credits):
            os.remove(file_path)
            raise HTTPException(status_code=403, detail="Daily limit reached. Please upgrade to Pro or watch an ad for +5 credits.")

    # 2. Setup
    file_type = utils.get_file_type(file.filename)
    if file_type == "unknown":
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    t_start = time.time()
    media_info = utils.get_media_info(file_path)
    timings["ffprobe"] = time.time() - t_start
    
    original_res = media_info["resolution"] if media_info else None
    
    db_task = models.EnhancementTask(
        owner_id=current_user.id,
        filename=file.filename,
        file_type=file_type,
        tool=tool,
        original_path=file_path,
        original_size=original_size,
        original_resolution=original_res,
        status=models.TaskStatus.PROCESSING
    )
    db.add(db_task)
    db.commit()
    
    # 3. Processing
    try:
        base, ext = os.path.splitext(file.filename)
        
        enhanced_filename = f"proc_{uuid.uuid4()}{ext}"
        enhanced_path = os.path.join("uploads/enhanced", enhanced_filename)
        
        # 3. Actual Processing
        t_start = time.time()
        if file_type == "image":
            image_processor.process(file_path, enhanced_path, tool)
        else:
            video_processor.process(file_path, enhanced_path, tool)
        timings["FFmpeg"] = time.time() - t_start

        enhanced_info = utils.get_media_info(enhanced_path)

        # Final validation and Cloudinary Upload
        if os.path.exists(enhanced_path) and os.path.getsize(enhanced_path) > 0:
            # Upload both to Cloudinary for production persistence
            t_start = time.time()
            cloudinary_original_url = utils.upload_to_cloudinary(
                file_path, 
                resource_type="image" if file_type == "image" else "video"
            )
            timings["Cloudinary original upload"] = time.time() - t_start
            
            t_start = time.time()
            cloudinary_enhanced_url = utils.upload_to_cloudinary(
                enhanced_path, 
                resource_type="image" if file_type == "image" else "video"
            )
            timings["Cloudinary enhanced upload"] = time.time() - t_start
            
            t_start = time.time()
            db_task.status = models.TaskStatus.COMPLETED
            db_task.original_path = cloudinary_original_url
            db_task.enhanced_path = cloudinary_enhanced_url # Store secure URL
            db_task.enhanced_size = os.path.getsize(enhanced_path)
            db_task.enhanced_resolution = enhanced_info["resolution"] if enhanced_info else None
            db_task.output_format = enhanced_info["format"] if enhanced_info else None
            db_task.progress = 100
            
            # Update usage
            if not is_pro:
                usage = get_user_usage(db, current_user.id)
                usage.count_today += 1
                usage.total_count += 1
            
            db_task.processing_time = time.time() - total_start
            db.commit()
            timings["Database update"] = time.time() - t_start
            
            # Clean up local temporary files
            t_start = time.time()
            try:
                if os.path.exists(file_path): os.remove(file_path)
                if os.path.exists(enhanced_path): os.remove(enhanced_path)
            except Exception as cleanup_err:
                logger.error(f"Temp file cleanup failed: {cleanup_err}")
            timings["Cleanup"] = time.time() - t_start
        else:
            raise Exception("FFmpeg finished but output file is missing or empty")

    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        db_task.status = models.TaskStatus.FAILED
        db_task.error_message = str(e)
        db_task.processing_time = time.time() - total_start
        db.commit()
        
        # Cleanup on failure
        try:
            if 'file_path' in locals() and os.path.exists(file_path): os.remove(file_path)
            if 'enhanced_path' in locals() and os.path.exists(enhanced_path): os.remove(enhanced_path)
        except: pass
    
    # Print Performance Logs
    print("\n" + "="*30)
    print(f"PERFORMANCE PROFILE: {tool.upper()}")
    for stage, duration in timings.items():
        print(f"{stage}: {duration:.2f}s")
    print(f"Total request: {time.time() - total_start:.2f}s")
    print("="*30 + "\n")
    
    return db_task

@app.delete("/api/v1/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.EnhancementTask).filter(
        models.EnhancementTask.id == task_id,
        models.EnhancementTask.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete local files from disk if they exist
    try:
        if task.original_path and not task.original_path.startswith('http') and os.path.exists(task.original_path):
            os.remove(task.original_path)
        if task.enhanced_path and not task.enhanced_path.startswith('http') and os.path.exists(task.enhanced_path):
            os.remove(task.enhanced_path)
    except Exception as e:
        logger.error(f"Error deleting local files: {e}")
        
    db.delete(task)
    db.commit()
    return {"msg": "Task deleted"}

@app.get("/api/v1/tasks", response_model=List[schemas.Task])
def get_user_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.EnhancementTask).filter(models.EnhancementTask.owner_id == current_user.id).all()

@app.get("/api/v1/tasks/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.EnhancementTask).filter(
        models.EnhancementTask.id == task_id,
        models.EnhancementTask.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# Payments
rzp_client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    try:
        rzp_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    except Exception as e:
        logger.error(f"Failed to initialize Razorpay: {e}")

@app.post("/api/v1/payments/create-order")
async def create_order(
    plan: str = Form("pro"),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not rzp_client:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")
    try:
        amount = settings.PRICE_PRO_MONTHLY if plan == "pro" else settings.PRICE_LIFETIME
        
        # If user is already on this plan, don't allow duplicate purchase
        if current_user.subscription_plan == plan and current_user.subscription_status == "active":
             raise HTTPException(status_code=400, detail=f"You already have an active {plan} subscription")

        data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"receipt_{current_user.id}_{int(time.time())}",
            "notes": {
                "user_id": current_user.id,
                "plan": plan
            }
        }
        order = rzp_client.order.create(data=data)
        return order
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/payments/verify-payment")
async def verify_payment(
    order_id: str = Form(...),
    payment_id: str = Form(...),
    signature: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }
        rzp_client.utility.verify_payment_signature(params_dict)
        
        # Get order details to know the plan
        order = rzp_client.order.fetch(order_id)
        plan = order['notes'].get('plan', 'pro')
        
        # Update user
        current_user.subscription_plan = plan
        current_user.is_pro = True
        current_user.subscription_status = "active"
        
        if plan == "pro":
            # Set expiry to 30 days from now for pro
            current_user.subscription_end = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=30)
        else:
            # Lifetime has no expiry
            current_user.subscription_end = None
            
        db.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Payment verification failed")

@app.post("/api/v1/payments/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    # Razorpay Webhook implementation
    payload = await request.body()
    signature = request.headers.get('X-Razorpay-Signature')
    
    try:
        rzp_client.utility.verify_webhook_signature(payload.decode(), signature, settings.RAZORPAY_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    import json
    event = json.loads(payload)
    
    if event['event'] == 'order.paid':
        data = event['payload']['order']['entity']
        user_id = data['notes'].get('user_id')
        plan = data['notes'].get('plan')
        if user_id:
            user = db.query(models.User).filter(models.User.id == int(user_id)).first()
            if user:
                user.subscription_plan = plan
                user.is_pro = True
                user.subscription_status = "active"
                if plan == "pro":
                    user.subscription_end = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=30)
                db.commit()

    return {"status": "success"}

@app.get("/api/v1/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Basic security check
    if current_user.email != os.getenv("ADMIN_EMAIL", "admin@enhanceai.com"):
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    total_users = db.query(models.User).count()
    free_users = db.query(models.User).filter(models.User.subscription_plan == "free").count()
    pro_users = db.query(models.User).filter(models.User.subscription_plan == "pro").count()
    lifetime_users = db.query(models.User).filter(models.User.subscription_plan == "lifetime").count()
    total_tasks = db.query(models.EnhancementTask).count()
    
    return {
        "total_users": total_users,
        "free": free_users,
        "pro": pro_users,
        "lifetime": lifetime_users,
        "total_tasks": total_tasks,
        "mrr": pro_users * 29,
        "revenue": (pro_users * 29) + (lifetime_users * 499)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
