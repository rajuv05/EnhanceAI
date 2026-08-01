import subprocess
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class VideoProcessor:
    def _run_ffmpeg(self, cmd: list):
        try:
            logger.info(f"Running FFmpeg: {' '.join(cmd)}")
            subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e.stderr}")
            raise Exception(f"Processing failed: {e.stderr}")

    def compress(self, input_path: str, output_path: str):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vcodec", "libx264", "-crf", "28", "-preset", "medium", output_path]
        return self._run_ffmpeg(cmd)

    def resize(self, input_path: str, output_path: str, width: int = -2, height: int = 720):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"scale={width}:{height}", "-c:a", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def upscale(self, input_path: str, output_path: str):
        # Lanczos upscale to 1080p
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "scale=-2:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow", output_path]
        return self._run_ffmpeg(cmd)

    def sharpen(self, input_path: str, output_path: str):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "unsharp=5:5:1.0:5:5:0.0", "-c:a", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def brightness(self, input_path: str, output_path: str, level: float = 0.15):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=brightness={level}", "-c:a", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def contrast(self, input_path: str, output_path: str, level: float = 1.3):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=contrast={level}", "-c:a", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def saturation(self, input_path: str, output_path: str, level: float = 1.5):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=saturation={level}", "-c:a", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def trim(self, input_path: str, output_path: str, start: str = "00:00:00", duration: str = "00:00:15"):
        cmd = ["ffmpeg", "-y", "-ss", start, "-i", input_path, "-t", duration, "-c", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def crop(self, input_path: str, output_path: str):
        # Crop to center square
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "crop='min(iw,ih)':'min(iw,ih)'", "-c:a", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def rotate(self, input_path: str, output_path: str, direction: int = 1):
        # 1 = 90Clockwise, 2 = 90CounterClockwise
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"transpose={direction}", "-c:a", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def fps(self, input_path: str, output_path: str, fps: int = 30):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-filter:v", f"fps=fps={fps}", output_path]
        return self._run_ffmpeg(cmd)

    def convert(self, input_path: str, output_path: str):
        cmd = ["ffmpeg", "-y", "-i", input_path, output_path]
        return self._run_ffmpeg(cmd)

    def extract_audio(self, input_path: str, output_path: str):
        # Change extension to .mp3 in main if needed
        cmd = ["ffmpeg", "-y", "-i", input_path, "-q:a", "0", "-map", "a", output_path]
        return self._run_ffmpeg(cmd)

    def remove_audio(self, input_path: str, output_path: str):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-an", "-vcodec", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def gif(self, input_path: str, output_path: str):
        # Ensure .gif extension
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "fps=10,scale=320:-1:flags=lanczos", output_path]
        return self._run_ffmpeg(cmd)

    def watermark(self, input_path: str, output_path: str, text: str = "EnhanceAI"):
        cmd = [
            "ffmpeg", "-y", "-i", input_path, 
            "-vf", f"drawtext=text='{text}':x=10:y=H-th-10:fontcolor=white:fontsize=24:shadowcolor=black:shadowx=2:shadowy=2",
            "-c:a", "copy", output_path
        ]
        return self._run_ffmpeg(cmd)

    def thumbnail(self, input_path: str, output_path: str):
        # Capture frame at 1 second
        cmd = ["ffmpeg", "-y", "-ss", "00:00:01", "-i", input_path, "-vframes", "1", "-q:v", "2", output_path]
        return self._run_ffmpeg(cmd)

    def process(self, input_path: str, output_path: str, tool: str):
        # Dispatcher
        method = getattr(self, tool, None)
        if method:
            return method(input_path, output_path)
        else:
            # Default fallback
            return self.convert(input_path, output_path)

video_processor = VideoProcessor()
