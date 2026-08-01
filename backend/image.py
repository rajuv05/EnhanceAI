import subprocess
import os
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    def _run_ffmpeg(self, cmd: list):
        try:
            logger.info(f"Running Image FFmpeg: {' '.join(cmd)}")
            subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Image FFmpeg error: {e.stderr}")
            raise Exception(f"Processing failed: {e.stderr}")

    def resize(self, input_path: str, output_path: str):
        # 2x upscale using Lanczos
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "scale=iw*2:ih*2:flags=lanczos", output_path]
        return self._run_ffmpeg(cmd)

    def sharpen(self, input_path: str, output_path: str):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "unsharp=5:5:1.0:5:5:0.0", output_path]
        return self._run_ffmpeg(cmd)

    def brightness(self, input_path: str, output_path: str, level: float = 0.1):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=brightness={level}", output_path]
        return self._run_ffmpeg(cmd)

    def contrast(self, input_path: str, output_path: str, level: float = 1.3):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=contrast={level}", output_path]
        return self._run_ffmpeg(cmd)

    def saturation(self, input_path: str, output_path: str, level: float = 1.5):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"eq=saturation={level}", output_path]
        return self._run_ffmpeg(cmd)

    def optimize(self, input_path: str, output_path: str):
        # Quality 4 is a good balance for JPEG, PNG uses compression_level
        cmd = ["ffmpeg", "-y", "-i", input_path]
        if output_path.lower().endswith(('.jpg', '.jpeg')):
            cmd += ["-q:v", "4"]
        elif output_path.lower().endswith('.png'):
            cmd += ["-compression_level", "9"]
        cmd.append(output_path)
        return self._run_ffmpeg(cmd)

    def convert(self, input_path: str, output_path: str):
        cmd = ["ffmpeg", "-y", "-i", input_path, output_path]
        return self._run_ffmpeg(cmd)

    def crop(self, input_path: str, output_path: str):
        # Center square crop
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", "crop='min(iw,ih)':'min(iw,ih)'", output_path]
        return self._run_ffmpeg(cmd)

    def rotate(self, input_path: str, output_path: str, direction: int = 1):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"transpose={direction}", output_path]
        return self._run_ffmpeg(cmd)

    def flip(self, input_path: str, output_path: str, mode: str = "h"):
        # h = horizontal, v = vertical
        vf = "hflip" if mode == "h" else "vflip"
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", vf, output_path]
        return self._run_ffmpeg(cmd)

    def blur(self, input_path: str, output_path: str, sigma: int = 10):
        cmd = ["ffmpeg", "-y", "-i", input_path, "-vf", f"boxblur={sigma}:1", output_path]
        return self._run_ffmpeg(cmd)

    def watermark(self, input_path: str, output_path: str, text: str = "EnhanceAI"):
        # Use a simpler filter if drawtext fails or use a common font path
        # Try to find a font on common systems
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "arial.ttf"
        ]
        font_file = ""
        for path in font_paths:
            if os.path.exists(path):
                # Escape colons for Windows paths in FFmpeg filters
                safe_path = path.replace(":", "\\\\:")
                font_file = f":fontfile='{safe_path}'"
                break

        cmd = [
            "ffmpeg", "-y", "-i", input_path, 
            "-vf", f"drawtext=text='{text}':x=10:y=H-th-10:fontcolor=white:fontsize=48{font_file}:shadowcolor=black:shadowx=2:shadowy=2",
            output_path
        ]
        return self._run_ffmpeg(cmd)

    def process(self, input_path: str, output_path: str, tool: str):
        method = getattr(self, tool, None)
        if method:
            return method(input_path, output_path)
        else:
            return self.optimize(input_path, output_path)

image_processor = ImageProcessor()
