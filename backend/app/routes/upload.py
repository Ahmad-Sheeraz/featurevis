from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io

from app.services.image_processor import preprocess_image
from app.services.hook_extractor import extractor
from app.services.attribution import attribution_extractor

router = APIRouter()


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    model_info = extractor.get_model_info()
    tensor = preprocess_image(
        image,
        input_size=model_info["input_size"],
        mean=model_info["normalization"]["mean"],
        std=model_info["normalization"]["std"]
    )
    
    result = extractor.extract(tensor)
    
    attribution_extractor.set_model(extractor.model)
    attribution_extractor.set_input(tensor, result["predictions"]["top5_indices"][0])
    
    return {
        "status": "processed",
        "layers_captured": len(result["activations"]),
        "predictions": result["predictions"],
        "model_info": model_info,
    }
