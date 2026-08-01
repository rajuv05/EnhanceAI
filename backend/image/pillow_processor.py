from PIL import Image, ImageEnhance, ImageOps
import io
import os

class PillowProcessor:
    @staticmethod
    def open_image(input_path: str) -> Image.Image:
        img = Image.open(input_path)
        # Preserve EXIF orientation
        img = ImageOps.exif_transpose(img)
        return img

    @staticmethod
    def compress(img: Image.Image, output_path: str):
        """High-efficiency compression using Pillow."""
        ext = os.path.splitext(output_path)[1].lower()
        save_args = {"optimize": True}
        
        if ext in ['.jpg', '.jpeg']:
            img = img.convert("RGB")
            save_args["quality"] = 85
            save_args["subsampling"] = 0 # 4:4:4
        elif ext == '.png':
            save_args["compress_level"] = 9
        elif ext == '.webp':
            save_args["quality"] = 80
            save_args["method"] = 6 # slowest but best
            
        img.save(output_path, **save_args)

    @staticmethod
    def optimize(img: Image.Image, output_path: str):
        """Metadata stripping and optimized encoding."""
        # Pillow's save without extra info already strips most things
        ext = os.path.splitext(output_path)[1].lower()
        save_args = {"optimize": True}
        
        if ext in ['.jpg', '.jpeg']:
            img = img.convert("RGB")
            save_args["quality"] = 95
        elif ext == '.webp':
            save_args["lossless"] = True
            
        img.save(output_path, **save_args)

    @staticmethod
    def brightness(img: Image.Image, level: float = 1.2) -> Image.Image:
        """Improve brightness naturally."""
        enhancer = ImageEnhance.Brightness(img)
        # level 1.0 is original, >1.0 is brighter
        return enhancer.enhance(level)
