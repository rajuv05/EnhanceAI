import subprocess
import os
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

class VideoProcessor:
    def __init__(self):
        self.hw_encoder = self._detect_hw_encoder()

    @lru_cache(maxsize=1)
    def _detect_hw_encoder(self):
        """Detect available hardware encoders for massive speed gains."""
        try:
            result = subprocess.run(["ffmpeg", "-encoders"], capture_output=True, text=True)
            if "h264_nvenc" in result.stdout:
                logger.info("NVIDIA NVENC detected. Using GPU for processing.")
                return "h264_nvenc"
            elif "h264_vaapi" in result.stdout:
                logger.info("VAAPI detected. Using hardware acceleration.")
                return "h264_vaapi"
            elif "h264_qsv" in result.stdout:
                logger.info("Intel QuickSync detected. Using hardware acceleration.")
                return "h264_qsv"
        except Exception as e:
            logger.warning(f"Hardware encoder detection failed: {e}")
        return "libx264" # Standard CPU fallback

    def _run_ffmpeg(self, cmd: list):
        try:
            # Prepend global speed optimizations
            # -threads 0: use all cores
            # -hwaccel auto: use hardware decoding if possible
            full_cmd = ["ffmpeg", "-hwaccel", "auto", "-y", "-threads", "0"] + cmd[1:]
            
            logger.info(f"Executing FFmpeg: {' '.join(full_cmd)}")
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
        """Optimization: Veryfast preset + AAC audio + Faststart."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vcodec", self.hw_encoder, 
            "-crf", "26", 
            "-preset", "veryfast", 
            "-acodec", "aac", "-b:a", "128k",
            "-movflags", "+faststart", 
            output_path
        ]
        # HW encoders don't support CRF in the same way, need custom bitrate logic usually
        if self.hw_encoder != "libx264":
            cmd = ["ffmpeg", "-i", input_path, "-vcodec", self.hw_encoder, "-rc", "vbr", "-cq", "26", "-preset", "p1", "-acodec", "aac", "-movflags", "+faststart", output_path]
        
        return self._run_ffmpeg(cmd)

    def optimize(self, input_path: str, output_path: str):
        """Optimization: Instant stream copy (no re-encoding)."""
        cmd = ["ffmpeg", "-i", input_path, "-vcodec", "copy", "-acodec", "copy", "-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def sharpen(self, input_path: str, output_path: str):
        """Optimization: Optimized unsharp mask for speed."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", "unsharp=3:3:1.2:3:3:0.0", 
            "-vcodec", self.hw_encoder, 
            "-crf", "22", 
            "-preset", "veryfast", 
            "-acodec", "copy", 
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def brightness(self, input_path: str, output_path: str, level: float = 0.08):
        """Optimization: Lightweight eq filter."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", f"eq=brightness={level}:contrast=1.1:gamma=1.0", 
            "-vcodec", self.hw_encoder, 
            "-crf", "22", 
            "-preset", "veryfast", 
            "-acodec", "copy", 
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def crop(self, input_path: str, output_path: str):
        """Optimization: Faster center square crop."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", "crop='min(iw,ih)':'min(iw,ih)'", 
            "-vcodec", self.hw_encoder, 
            "-crf", "20", 
            "-preset", "veryfast", 
            "-acodec", "copy", 
            "-movflags", "+faststart", 
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def resize(self, input_path: str, output_path: str, width: int = -2, height: int = 720):
        """Optimization: Bilinear scaling is significantly faster than Lanczos."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", f"scale={width}:{height}:flags=bilinear", 
            "-vcodec", self.hw_encoder, 
            "-crf", "22", 
            "-preset", "veryfast", 
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
