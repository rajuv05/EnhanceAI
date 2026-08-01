import cv2
import numpy as np
from PIL import Image

class OpenCVProcessor:
    @staticmethod
    def pil_to_cv(pil_image: Image.Image) -> np.ndarray:
        # Convert PIL to OpenCV (BGR)
        if pil_image.mode == 'RGBA':
            return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGBA2BGRA)
        return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    @staticmethod
    def cv_to_pil(cv_image: np.ndarray) -> Image.Image:
        # Convert OpenCV (BGR) to PIL
        if cv_image.shape[2] == 4:
            return Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGRA2RGBA))
        return Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))

    @staticmethod
    def sharpen(pil_image: Image.Image) -> Image.Image:
        """Natural unsharp mask using OpenCV."""
        cv_img = OpenCVProcessor.pil_to_cv(pil_image)
        
        # Unsharp Mask: sharpened = original + (original - blurred) * amount
        # Gaussian blur for the mask
        blurred = cv2.GaussianBlur(cv_img, (0, 0), 3)
        sharpened = cv2.addWeighted(cv_img, 1.5, blurred, -0.5, 0)
        
        return OpenCVProcessor.cv_to_pil(sharpened)
