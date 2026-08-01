from .pillow_processor import PillowProcessor
from .opencv_processor import OpenCVProcessor
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    def process(self, input_path: str, output_path: str, tool: str):
        try:
            logger.info(f"Image processing: {input_path} with {tool}")
            img = PillowProcessor.open_image(input_path)
            
            if tool == "compress":
                PillowProcessor.compress(img, output_path)
            
            elif tool == "optimize":
                PillowProcessor.optimize(img, output_path)
            
            elif tool == "sharpen":
                sharpened_img = OpenCVProcessor.sharpen(img)
                PillowProcessor.optimize(sharpened_img, output_path)
            
            elif tool == "brightness":
                bright_img = PillowProcessor.brightness(img, 1.3)
                PillowProcessor.optimize(bright_img, output_path)
                
            else:
                logger.warning(f"Unknown tool: {tool}, defaulting to optimize")
                PillowProcessor.optimize(img, output_path)
                
            return output_path
            
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            raise Exception(f"Image processing error: {str(e)}")

image_processor = ImageProcessor()
