import subprocess
import os
import logging

logger = logging.getLogger(__name__)

class VideoProcessor:
    def _run_ffmpeg(self, cmd: list):
        try:
            logger.info(f"Running Video FFmpeg: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            output_path = cmd[-1]
            if os.path.exists(output_path):
                size = os.path.getsize(output_path)
                logger.info(f"Video FFmpeg successful. Output: {output_path} ({size} bytes)")
                return True
            else:
                logger.error(f"Video FFmpeg missing output file: {output_path}")
                raise Exception("Video processing failed to produce file")
        except subprocess.CalledProcessError as e:
            logger.error(f"Video FFmpeg error. Code: {e.returncode}")
            logger.error(f"stderr: {e.stderr}")
            raise Exception(f"Video processing failed: {e.stderr}")

    def compress(self, input_path: str, output_path: str):
        """High-efficiency H.264 compression with balanced quality."""
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vcodec", "libx264", "-crf", "28", "-preset", "medium", "-acodec", "aac", "-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def optimize(self, input_path: str, output_path: str):
        """Optimize video for streaming without re-encoding if possible."""
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vcodec", "copy", "-acodec", "copy", "-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def sharpen(self, input_path: str, output_path: str):
        """Natural sharpening algorithm using unsharp filter."""
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "unsharp=5:5:0.8:5:5:0.0", "-vcodec", "libx264", "-crf", "23", "-acodec", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def brightness(self, input_path: str, output_path: str, level: float = 0.15):
        """Improve exposure using eq filter."""
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=brightness={level}:gamma=1.1", "-vcodec", "libx264", "-crf", "23", "-acodec", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def crop(self, input_path: str, output_path: str):
        """High-quality center square crop."""
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "crop='min(iw,ih)':'min(iw,ih)'", "-vcodec", "libx264", "-crf", "20", "-acodec", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def resize(self, input_path: str, output_path: str, width: int = -2, height: int = 720):
        """Resize using high-quality Lanczos interpolation."""
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"scale={width}:{height}:flags=lanczos", "-vcodec", "libx264", "-crf", "23", "-acodec", "copy", output_path]
        return self._run_ffmpeg(cmd)

    def process(self, input_path: str, output_path: str, tool: str):
        method = getattr(self, tool, None)
        if method:
            return method(input_path, output_path)
        else:
            return self.optimize(input_path, output_path)

video_processor = VideoProcessor()
