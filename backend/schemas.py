from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_pro: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    filename: str
    file_type: str
    tool: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    owner_id: int
    status: str
    progress: int
    original_path: str
    enhanced_path: Optional[str] = None
    processing_time: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
