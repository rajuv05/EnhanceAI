import subprocess
import os
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    def _run_ffmpeg(self, cmd: list):
        try:
            logger.info(f"Running Image FFmpeg: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            output_path = cmd[-1]
            if os.path.exists(output_path):
                size = os.path.getsize(output_path)
                logger.info(f"Image FFmpeg successful. Output: {output_path} ({size} bytes)")
                return True
            else:
                logger.error(f"Image FFmpeg missing output file: {output_path}")
                raise Exception("Image processing failed to produce file")
        except subprocess.CalledProcessError as e:
            logger.error(f"Image FFmpeg error. Code: {e.returncode}")
            logger.error(f"stderr: {e.stderr}")
            raise Exception(f"Image processing failed: {e.stderr}")

    def compress(self, input_path: str, output_path: str):
        """High-efficiency compression while preserving visual quality."""
        cmd = ["ffmpeg", "-y", "-i", input_path]
        if output_path.lower().endswith(('.jpg', '.jpeg')):
            # Quality 4 is high (approx 85-90% quality), balanced file size
            cmd += ["-q:v", "4"]
        elif output_path.lower().endswith('.png'):
            # Max compression for PNG
            cmd += ["-compression_level", "9"]
        else:
            cmd += ["-q:v", "5"]
        
        cmd.append(output_path)
        return self._run_ffmpeg(cmd)

    def optimize(self, input_path: str, output_path: str):
        """Optimize for web: progressive encoding and metadata stripping."""
        cmd = ["ffmpeg", "-y", "-i", input_path]
        
        if output_path.lower().endswith(('.jpg', '.jpeg')):
            cmd += ["-interlace", "plane", "-q:v", "3"]
        elif output_path.lower().endswith('.png'):
            cmd += ["-compression_level", "9"]
            
        cmd.append(output_path)
        return self._run_ffmpeg(cmd)

    def sharpen(self, input_path: str, output_path: str):
        """Natural sharpening algorithm using unsharp filter."""
        # Careful values to avoid over-sharpening artifacts
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "unsharp=3:3:0.7:3:3:0.0", output_path]
        return self._run_ffmpeg(cmd)

    def brightness(self, input_path: str, output_path: str, level: float = 0.1):
        """Improve exposure using eq filter with balanced gamma."""
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=brightness={level}:gamma=1.1", output_path]
        return self._run_ffmpeg(cmd)

    def process(self, input_path: str, output_path: str, tool: str):
        method = getattr(self, tool, None)
        if method:
            return method(input_path, output_path)
        else:
            return self.optimize(input_path, output_path)

image_processor = ImageProcessor()
