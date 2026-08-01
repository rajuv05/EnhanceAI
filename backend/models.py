import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base
import enum

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
    is_active = Column(Boolean, default=True)
    stripe_customer_id = Column(String, nullable=True)
    is_pro = Column(Boolean, default=False)
    subscription_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC))

    tasks = relationship("EnhancementTask", back_populates="owner")

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
    processing_time = Column(Float, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC), onupdate=lambda: datetime.datetime.now(datetime.UTC))

    owner = relationship("User", back_populates="tasks")
