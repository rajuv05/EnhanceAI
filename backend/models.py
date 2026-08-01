import datetime
import enum

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship

from database import Base


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)


    verification_expiry = Column(
    DateTime(timezone=True),
    nullable=True
)
    stripe_customer_id = Column(String, nullable=True)
    is_pro = Column(Boolean, default=False)
    subscription_plan = Column(String, default="free") # free, pro, lifetime
    subscription_status = Column(String, default="active") # active, trialing, past_due, canceled
    subscription_id = Column(String, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC))

    tasks = relationship("EnhancementTask", back_populates="owner")
    usage = relationship("UserUsage", back_populates="owner", uselist=False)

class UserUsage(Base):
    __tablename__ = "user_usage"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    count_today = Column(Integer, default=0)
    reward_credits = Column(Integer, default=0)
    reward_ads_watched = Column(Integer, default=0)
    last_reset = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC))
    total_count = Column(Integer, default=0)
    
    owner = relationship("User", back_populates="usage")

class EnhancementTask(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_type = Column(String) # image or video
    tool = Column(String, nullable=True) # e.g., "compress", "upscale", "sharpen"
    status = Column(String, default=TaskStatus.PENDING)
    progress = Column(Integer, default=0)
    original_path = Column(String)
    enhanced_path = Column(String, nullable=True)
    original_size = Column(Float, nullable=True)
    enhanced_size = Column(Float, nullable=True)
    original_resolution = Column(String, nullable=True)
    enhanced_resolution = Column(String, nullable=True)
    output_format = Column(String, nullable=True)
    processing_time = Column(Float, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), onupdate=lambda: datetime.datetime.now(datetime.UTC))

    owner = relationship("User", back_populates="tasks")
