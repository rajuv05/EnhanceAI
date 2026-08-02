import os
import uuid
import shutil
import subprocess
import json
import logging
from pathlib import Path
from fastapi import UploadFile
import cloudinary
import cloudinary.uploader
from config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

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

def _run_ffmpeg(self, cmd: list):
    try:
        full_cmd = ["ffmpeg", "-hide_banner", "-y", "-threads", "0"] + cmd[1:]

        logger.info(f"Executing FFmpeg: {' '.join(full_cmd)}")

        import time
        start = time.perf_counter()

        result = subprocess.run(
            full_cmd,
            capture_output=True,
            text=True,
            check=True
        )

        elapsed = time.perf_counter() - start
        logger.info(f"Pure FFmpeg execution: {elapsed:.2f}s")

        output_path = full_cmd[-1]

        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            logger.info(f"Output: {output_path} ({size} bytes)")
            return True

        raise Exception("FFmpeg failed")

    except subprocess.CalledProcessError as e:
        logger.error(e.stderr)
        raise

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
            "resolution": None,
            "audio_codec": None
        }
        
        for stream in data.get("streams", []):
            if stream.get("codec_type") == "video" and not info["width"]:
                info["width"] = stream["width"]
                info["height"] = stream["height"]
                info["resolution"] = f"{stream['width']}x{stream['height']}"
            elif stream.get("codec_type") == "audio":
                info["audio_codec"] = stream.get("codec_name")
        
        return info
    except Exception as e:
        logger.error(f"Error getting media info: {e}")
        return None

def upload_to_cloudinary(file_path: str, resource_type: str = "auto") -> str:
    """Uploads a local file to Cloudinary and returns the secure URL."""
    try:
        response = cloudinary.uploader.upload(
            file_path, 
            resource_type=resource_type,
            folder="enhancify"
        )
        return response.get("secure_url")
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise Exception(f"Cloudinary upload failed: {str(e)}")
