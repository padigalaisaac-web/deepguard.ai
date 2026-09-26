import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
from PIL import Image, ImageOps, ExifTags
import numpy as np

class ImagePreprocessor:
    @staticmethod
    def load_and_preprocess(file_path: Path, target_size: Tuple[int, int] = (512, 512)) -> Tuple[Image.Image, np.ndarray, Dict[str, Any]]:
        """
        Loads image, auto-orients via EXIF, converts to RGB, extracts metadata,
        and generates normalized numpy array.
        """
        img = Image.open(file_path)
        img = ImageOps.exif_transpose(img)
        
        orig_width, orig_height = img.size
        format_name = img.format or file_path.suffix.upper().replace(".", "")
        mode = img.mode
        
        ai_tags: List[str] = []
        
        # Check PNG text chunks / info for AI generative parameters
        if hasattr(img, "info") and isinstance(img.info, dict):
            for k, v in img.info.items():
                k_lower = str(k).lower()
                v_str = str(v).lower()
                if any(ai_term in k_lower or ai_term in v_str for ai_term in [
                    "prompt", "parameters", "workflow", "stablediffusion", "midjourney",
                    "civitai", "comfyui", "novelai", "dall-e", "flux", "generation"
                ]):
                    ai_tags.append(k)

        # Extract metadata & EXIF
        metadata: Dict[str, Any] = {
            "width": orig_width,
            "height": orig_height,
            "format": format_name,
            "mode": mode,
            "color_channels": len(img.getbands()),
            "has_exif": False,
            "camera_make": None,
            "camera_model": None,
            "software": None,
            "ai_metadata_tags": ai_tags,
        }
        
        try:
            exif_data = img.getexif()
            if exif_data:
                metadata["has_exif"] = True
                for tag_id, val in exif_data.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    if tag_name == "Make":
                        metadata["camera_make"] = str(val).strip()
                    elif tag_name == "Model":
                        metadata["camera_model"] = str(val).strip()
                    elif tag_name == "Software":
                        software_val = str(val).strip()
                        metadata["software"] = software_val
                        if any(ai_term in software_val.lower() for ai_term in ["midjourney", "stable diffusion", "dalle", "comfyui", "flux", "civitai"]):
                            ai_tags.append("Software: " + software_val)
        except Exception:
            pass

        metadata["ai_metadata_tags"] = ai_tags

        # Convert to RGB
        if img.mode != "RGB":
            img_rgb = img.convert("RGB")
        else:
            img_rgb = img
            
        img_array = np.array(img_rgb)
        
        return img_rgb, img_array, metadata
