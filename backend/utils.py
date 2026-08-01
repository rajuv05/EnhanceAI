import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("uploads")
ORIGINAL_DIR = UPLOAD_DIR / "original"
ENHANCED_DIR = UPLOAD_DIR / "enhanced"

# Ensure directories exist
ORIGINAL_DIR.mkdir(parents=True, exist_ok=True)
ENHANCED_DIR.mkdir(parents=True, exist_ok=True)

def save_upload_file(upload_file: UploadFile) -> str:
    """Saves an uploaded file and returns the path."""
    file_extension = Path(upload_file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    dest = ORIGINAL_DIR / unique_filename
    
    with dest.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return str(dest)

def get_file_type(filename: str) -> str:
    """Simple check for image vs video."""
    image_exts = {'.jpg', '.jpeg', '.png', '.webp'}
    video_exts = {'.mp4', '.mov', '.avi', '.mkv'}
    ext = Path(filename).suffix.lower()
    
    if ext in image_exts:
        return "image"
    elif ext in video_exts:
        return "video"
    return "unknown"
