import subprocess
import os
import logging

logger = logging.getLogger(__name__)

class VideoProcessor:
    def _run_ffmpeg(self, cmd: list):
        try:
            # -threads 0: Use all available CPU cores
            # -hide_banner: Cleaner logs
            full_cmd = ["ffmpeg", "-hide_banner", "-y", "-threads", "0"] + cmd[1:]
            
            logger.info(f"Executing Optimized CPU FFmpeg: {' '.join(full_cmd)}")
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

    def _get_audio_params(self, audio_codec: str):
        """Smart audio optimization: copy if AAC, else transcode."""
        if audio_codec == "aac":
            return ["-acodec", "copy"]
        return ["-acodec", "aac", "-b:a", "128k"]

    def compress(self, input_path: str, output_path: str, audio_codec: str = None):
        """Optimization: 'fast' preset + smart audio."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vcodec", "libx264", 
            "-crf", "24", 
            "-preset", "fast"
        ]
        cmd += self._get_audio_params(audio_codec)
        cmd += ["-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def optimize(self, input_path: str, output_path: str):
        """Optimization: Instant stream copy."""
        cmd = ["ffmpeg", "-i", input_path, "-vcodec", "copy", "-acodec", "copy", "-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def sharpen(self, input_path: str, output_path: str, audio_codec: str = None):
        """Optimization: Natural sharpening + fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", "unsharp=3:3:0.8:3:3:0.0", 
            "-vcodec", "libx264", 
            "-crf", "22", 
            "-preset", "fast"
        ]
        cmd += self._get_audio_params(audio_codec)
        cmd += ["-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def brightness(self, input_path: str, output_path: str, audio_codec: str = None, level: float = 0.1):
        """Optimization: Fast eq filter + fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", f"eq=brightness={level}:gamma=1.1", 
            "-vcodec", "libx264", 
            "-crf", "22", 
            "-preset", "fast"
        ]
        cmd += self._get_audio_params(audio_codec)
        cmd += ["-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def crop(self, input_path: str, output_path: str, audio_codec: str = None):
        """Optimization: Efficient crop + fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", "crop='min(iw,ih)':'min(iw,ih)'", 
            "-vcodec", "libx264", 
            "-crf", "20", 
            "-preset", "fast"
        ]
        cmd += self._get_audio_params(audio_codec)
        cmd += ["-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def resize(self, input_path: str, output_path: str, audio_codec: str = None, width: int = -2, height: int = 720):
        """Optimization: Fast scale + fast preset."""
        cmd = [
            "ffmpeg", "-i", input_path, 
            "-vf", f"scale={width}:{height}", 
            "-vcodec", "libx264", 
            "-crf", "22", 
            "-preset", "fast"
        ]
        cmd += self._get_audio_params(audio_codec)
        cmd += ["-movflags", "+faststart", output_path]
        return self._run_ffmpeg(cmd)

    def process(self, input_path: str, output_path: str, tool: str, media_info: dict = None):
        audio_codec = media_info.get("audio_codec") if media_info else None
        
        # Mapping tools to methods
        if tool == "compress":
            return self.compress(input_path, output_path, audio_codec)
        elif tool == "optimize":
            return self.optimize(input_path, output_path)
        elif tool == "sharpen":
            return self.sharpen(input_path, output_path, audio_codec)
        elif tool == "brightness":
            return self.brightness(input_path, output_path, audio_codec)
        elif tool == "crop":
            return self.crop(input_path, output_path, audio_codec)
        elif tool == "resize":
            return self.resize(input_path, output_path, audio_codec)
        else:
            return self.optimize(input_path, output_path)

video_processor = VideoProcessor()
