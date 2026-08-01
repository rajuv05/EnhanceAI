from PIL import Image, ImageEnhance, ImageFilter
import os

class ImageProcessor:
    @staticmethod
    def process(input_path: str, output_path: str, tool: str):
        with Image.open(input_path) as img:
            if tool == "resize":
                # Upscale by 2x as a default for "resize" tool
                w, h = img.size
                img = img.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
            
            elif tool == "sharpen":
                img = img.filter(ImageFilter.SHARPEN)
            
            elif tool == "brightness":
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(1.5)
            
            elif tool == "contrast":
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1.5)
            
            elif tool == "saturation":
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(1.5)
            
            elif tool == "optimize":
                # Handled by save parameters
                pass
            
            elif tool == "convert":
                # Convert to PNG if it's not
                if not output_path.lower().endswith('.png'):
                    output_path = os.path.splitext(output_path)[0] + ".png"
            
            # Save with optimization
            save_args = {"optimize": True}
            if output_path.lower().endswith(('.jpg', '.jpeg')):
                save_args["quality"] = 85
            
            img.save(output_path, **save_args)
            return output_path

image_processor = ImageProcessor()
