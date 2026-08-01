import subprocess
import os
import logging

logger = logging.getLogger(__name__)

class VideoProcessor:
    def _run_ffmpeg(self, cmd: list):
        try:
            # use all cores
            full_cmd = ["ffmpeg", "-y", "-threads", "0"] + cmd[1:]
            
            logger.info(f"Executing CPU FFmpeg: {' '.join(full_cmd)}")
            result = subprocess.run(full_cmd, capture_output=True, text=True, check=True)
            
            output_path = full_cmd[-1]
            if os.path.exists(output_path):
                size = os.path.getsize(output_path)
                logger.info(f"FFmpeg finished. Output: {output_path} ({size} bytes)")
                return True
            else:
                raise Exception("FFmpeg failed to produce output file")
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error code {e.returncode}")
            logger.error(f"FFmpeg stderr: {e.stderr}")
            raise Exception(f"Video processing failed: {e.stderr}")

    def compress(self, input_path: str, output_path: str):
        """CPU Optimization: 'fast' preset is the sweet spot for speed/quality."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vcodec", "libx264", 
            "-crf", "24", 
            "-preset", "fast", 
            "-acodec", "aac", "-b:a", "128k",
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def optimize(self, input_path: str, output_path: str):
        """CPU Optimization: Instant stream copy (no re-encoding)."""
        cmd = ["ffmpeg", "-i", input_path, "-vcodec", "copy", "-acodec", "copy", "-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def sharpen(self, input_path: str, output_path: str):
        """CPU Optimization: Lighter unsharp filter + fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", "unsharp=3:3:1.0:3:3:0.0", 
            "-vcodec", "libx264", 
            "-crf", "22", 
            "-preset", "fast", 
            "-acodec", "copy", 
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def brightness(self, input_path: str, output_path: str, level: float = 0.08):
        """CPU Optimization: Balanced eq filter + fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", f"eq=brightness={level}:contrast=1.1:gamma=1.0", 
            "-vcodec", "libx264", 
            "-crf", "22", 
            "-preset", "fast", 
            "-acodec", "copy", 
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def crop(self, input_path: str, output_path: str):
        """CPU Optimization: Center square crop + fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", "crop='min(iw,ih)':'min(iw,ih)'", 
            "-vcodec", "libx264", 
            "-crf", "20", 
            "-preset", "fast", 
            "-acodec", "copy", 
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def resize(self, input_path: str, output_path: str, width: int = -2, height: int = 720):
        """CPU Optimization: scale with fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", f"scale={width}:{height}", 
            "-vcodec", "libx264", 
            "-crf", "22", 
            "-preset", "fast",
            "-acodec", "copy", 
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def process(self, input_path: str, output_path: str, tool: str):
        method = getattr(self, tool, None)
        if method:
            return method(input_path, output_path)
        else:
            return self.optimize(input_path, output_path)

video_processor = VideoProcessor()
