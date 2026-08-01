import logging
import time
import os
import uuid
import datetime
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta

import models, schemas, auth, utils, email_util
from database import engine, get_db
from config import settings
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Media Processing Endpoints
@app.post("/api/v1/enhance", response_model=schemas.Task)
async def create_processing_task(
    file: UploadFile = File(...),
    tool: str = Form("optimize"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    file_type = utils.get_file_type(file.filename)
    if file_type == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    file_path = utils.save_upload_file(file)
    original_size = os.path.getsize(file_path)
    
    # Get original resolution
    media_info = utils.get_media_info(file_path)
    original_res = media_info["resolution"] if media_info else None
    
    # Create DB record
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
    db.refresh(db_task)
    
    start_time = time.time()
    try:
        # Determine enhanced filename with correct extension
        base, ext = os.path.splitext(file.filename)
        if tool == "gif": ext = ".gif"
        elif tool == "extract_audio": ext = ".mp3"
        elif tool == "thumbnail": ext = ".jpg"
        
        enhanced_filename = f"proc_{uuid.uuid4()}{ext}"
        enhanced_path = os.path.join("uploads/enhanced", enhanced_filename)
        
        if file_type == "image":
            image_processor.process(file_path, enhanced_path, tool)
        else:
            video_processor.process(file_path, enhanced_path, tool)
            
        # Get enhanced info
        enhanced_info = utils.get_media_info(enhanced_path)
        
        db_task.status = models.TaskStatus.COMPLETED
        db_task.enhanced_path = enhanced_path
        db_task.enhanced_size = os.path.getsize(enhanced_path)
        db_task.enhanced_resolution = enhanced_info["resolution"] if enhanced_info else None
        db_task.output_format = enhanced_info["format"] if enhanced_info else None
        db_task.progress = 100
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        db_task.status = models.TaskStatus.FAILED
        db_task.error_message = str(e)
    
    db_task.processing_time = time.time() - start_time
    db.commit()
    db.refresh(db_task)
    
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
    
    # Delete files from disk if they exist
    try:
        if os.path.exists(task.original_path):
            os.remove(task.original_path)
        if task.enhanced_path and os.path.exists(task.enhanced_path):
            os.remove(task.enhanced_path)
    except Exception as e:
        logger.error(f"Error deleting files: {e}")
        
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
import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@app.post("/api/v1/payments/create-checkout-session")
async def create_checkout_session(current_user: models.User = Depends(auth.get_current_user)):
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=['card'],
            line_items=[{'price': settings.STRIPE_PRO_PRICE_ID, 'quantity': 1}],
            mode='subscription',
            success_url=f"{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/pricing",
            metadata={"user_id": current_user.id}
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/payments/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata'].get('user_id')
        if user_id:
            user = db.query(models.User).filter(models.User.id == int(user_id)).first()
            if user:
                user.is_pro = True
                db.commit()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
