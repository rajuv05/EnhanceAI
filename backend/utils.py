import os
import uuid
import shutil
import subprocess
import json
import logging
from pathlib import Path
from fastapi import UploadFile

logger = logging.getLogger(__name__)

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
    image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'}
    video_exts = {'.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'}
    ext = Path(filename).suffix.lower()
    
    if ext in image_exts:
        return "image"
    elif ext in video_exts:
        return "video"
    return "unknown"

def get_media_info(file_path: str):
    """Get resolution and format info using ffprobe."""
    try:
        cmd = [
            "ffprobe", 
            "-v", "quiet", 
            "-print_format", "json", 
            "-show_streams", 
            "-show_format", 
            file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        data = json.loads(result.stdout)
        
        info = {
            "format": data.get("format", {}).get("format_name"),
            "width": None,
            "height": None,
            "resolution": None
        }
        
        for stream in data.get("streams", []):
            if stream.get("width") and stream.get("height"):
                info["width"] = stream["width"]
                info["height"] = stream["height"]
                info["resolution"] = f"{stream['width']}x{stream['height']}"
                break
        
        return info
    except Exception as e:
        logger.error(f"Error getting media info: {e}")
        return None
