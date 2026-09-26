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
                    "prompt", "parameters", "workflow", "stablediffusion", "stable diffusion",
                    "midjourney", "civitai", "comfyui", "novelai", "dall-e", "dalle",
                    "flux", "generation", "negative prompt", "steps:", "sampler:", "cfg scale:", "seed:"
                ]):
                    ai_tags.append(f"{k}: {v_str[:80]}")

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
            "lens_model": None,
            "software": None,
            "datetime_original": None,
            "iso": None,
            "f_number": None,
            "exposure_time": None,
            "focal_length": None,
            "is_camera_hardware_verified": False,
            "ai_metadata_tags": ai_tags,
        }
        
        try:
            exif_obj = img.getexif()
            if exif_obj:
                raw_tags = dict(exif_obj.items())
                # Also get Exif IFD sub-dictionary for camera shooting tags
                try:
                    if hasattr(ExifTags, "IFD") and hasattr(ExifTags.IFD, "Exif"):
                        exif_ifd = exif_obj.get_ifd(ExifTags.IFD.Exif)
                        if exif_ifd:
                            raw_tags.update(exif_ifd)
                except Exception:
                    pass

                if raw_tags:
                    metadata["has_exif"] = True
                    for tag_id, val in raw_tags.items():
                        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                        if tag_name == "Make" and val:
                            metadata["camera_make"] = str(val).strip()
                        elif tag_name == "Model" and val:
                            metadata["camera_model"] = str(val).strip()
                        elif tag_name in ("LensModel", "LensMake") and val:
                            metadata["lens_model"] = str(val).strip()
                        elif tag_name == "DateTimeOriginal" and val:
                            metadata["datetime_original"] = str(val).strip()
                        elif tag_name in ("ISOSpeedRatings", "PhotographicSensitivity") and val:
                            metadata["iso"] = str(val).strip()
                        elif tag_name == "FNumber" and val:
                            metadata["f_number"] = str(val).strip()
                        elif tag_name == "ExposureTime" and val:
                            metadata["exposure_time"] = str(val).strip()
                        elif tag_name == "FocalLength" and val:
                            metadata["focal_length"] = str(val).strip()
                        elif tag_name == "Software" and val:
                            software_val = str(val).strip()
                            metadata["software"] = software_val
                            if any(ai_term in software_val.lower() for ai_term in [
                                "midjourney", "stable diffusion", "dalle", "comfyui", "flux",
                                "civitai", "novelai", "invokeai", "fooocus", "firefly"
                            ]):
                                ai_tags.append("Software: " + software_val)
        except Exception:
            pass

        # Fallback to img._getexif() if available
        if not metadata["camera_make"] and hasattr(img, "_getexif"):
            try:
                raw_exif = img._getexif()
                if raw_exif:
                    metadata["has_exif"] = True
                    for tag_id, val in raw_exif.items():
                        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                        if tag_name == "Make" and not metadata["camera_make"] and val:
                            metadata["camera_make"] = str(val).strip()
                        elif tag_name == "Model" and not metadata["camera_model"] and val:
                            metadata["camera_model"] = str(val).strip()
                        elif tag_name in ("LensModel", "LensMake") and not metadata["lens_model"] and val:
                            metadata["lens_model"] = str(val).strip()
            except Exception:
                pass

        camera_make = metadata.get("camera_make") or ""
        camera_model = metadata.get("camera_model") or ""
        lens_model = metadata.get("lens_model") or ""
        
        # Verify physical camera hardware tags
        has_hw = bool(camera_make or camera_model or lens_model or metadata.get("f_number") or metadata.get("iso"))
        if has_hw and not ai_tags:
            metadata["is_camera_hardware_verified"] = True

        metadata["ai_metadata_tags"] = ai_tags

        # Convert to RGB
        if img.mode != "RGB":
            img_rgb = img.convert("RGB")
        else:
            img_rgb = img
            
        img_array = np.array(img_rgb)
        
        return img_rgb, img_array, metadata
