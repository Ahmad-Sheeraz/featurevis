from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
import os
import tempfile

from app.services.hook_extractor import extractor

router = APIRouter()

UPLOAD_DIR = tempfile.gettempdir()


class ModelRequest(BaseModel):
    model_name: str


@router.get("/models")
def get_available_models():
    return {
        "models": ["resnet18", "resnet50", "vgg16"],
        "current": extractor.get_model_info(),
    }


@router.post("/models/load")
def load_model(request: ModelRequest):
    layers = extractor.load_model(request.model_name)
    return {
        "status": "loaded",
        "model": request.model_name,
        "num_layers": len(layers),
        "info": extractor.get_model_info(),
    }


@router.post("/models/upload")
async def upload_custom_model(
    file: UploadFile = File(...),
    input_size: int = Form(224),
    mean_r: float = Form(0.485),
    mean_g: float = Form(0.456),
    mean_b: float = Form(0.406),
    std_r: float = Form(0.229),
    std_g: float = Form(0.224),
    std_b: float = Form(0.225),
    architecture: Optional[str] = Form(None),
):
    model_path = os.path.join(UPLOAD_DIR, file.filename)
    
    contents = await file.read()
    with open(model_path, 'wb') as f:
        f.write(contents)
    
    mean = [mean_r, mean_g, mean_b]
    std = [std_r, std_g, std_b]
    
    result = extractor.load_custom_model(
        model_path=model_path,
        input_size=input_size,
        mean=mean,
        std=std,
        architecture=architecture
    )
    
    if result["success"]:
        return {
            "status": "loaded",
            "model": file.filename,
            "num_layers": len(result["layers"]),
            "input_size": result["input_size"],
            "info": extractor.get_model_info(),
        }
    else:
        return {
            "status": "error",
            "error": result["error"],
        }


@router.get("/models/info")
def get_model_info():
    return extractor.get_model_info()
