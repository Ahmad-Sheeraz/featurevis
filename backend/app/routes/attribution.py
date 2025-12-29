from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.attribution import attribution_extractor
from app.services.hook_extractor import extractor

router = APIRouter()


class GradCAMRequest(BaseModel):
    layer_name: str


class OcclusionRequest(BaseModel):
    window_size: int = 15
    stride: int = 8


class IGRequest(BaseModel):
    steps: int = 50


@router.get("/attribution/methods")
def get_available_methods():
    return {
        "methods": [
            {
                "name": "gradcam",
                "description": "Gradient-weighted Class Activation Mapping",
                "requires_layer": True,
            },
            {
                "name": "guided_gradcam",
                "description": "Guided GradCAM with finer details",
                "requires_layer": True,
            },
            {
                "name": "saliency",
                "description": "Simple gradient-based saliency",
                "requires_layer": False,
            },
            {
                "name": "integrated_gradients",
                "description": "Integrated Gradients attribution",
                "requires_layer": False,
            },
            {
                "name": "occlusion",
                "description": "Occlusion-based attribution",
                "requires_layer": False,
            },
        ]
    }


@router.post("/attribution/gradcam")
def compute_gradcam(request: GradCAMRequest):
    if extractor.model is None:
        raise HTTPException(status_code=400, detail="No model loaded")
    
    attribution_extractor.set_model(extractor.model)
    
    if attribution_extractor.last_input is None:
        raise HTTPException(status_code=400, detail="No image processed. Upload an image first.")
    
    result = attribution_extractor.gradcam(request.layer_name)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/attribution/guided_gradcam")
def compute_guided_gradcam(request: GradCAMRequest):
    if extractor.model is None:
        raise HTTPException(status_code=400, detail="No model loaded")
    
    attribution_extractor.set_model(extractor.model)
    
    if attribution_extractor.last_input is None:
        raise HTTPException(status_code=400, detail="No image processed. Upload an image first.")
    
    result = attribution_extractor.guided_gradcam(request.layer_name)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/attribution/saliency")
def compute_saliency():
    if extractor.model is None:
        raise HTTPException(status_code=400, detail="No model loaded")
    
    attribution_extractor.set_model(extractor.model)
    
    if attribution_extractor.last_input is None:
        raise HTTPException(status_code=400, detail="No image processed. Upload an image first.")
    
    result = attribution_extractor.saliency()
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/attribution/integrated_gradients")
def compute_integrated_gradients(request: IGRequest = IGRequest()):
    if extractor.model is None:
        raise HTTPException(status_code=400, detail="No model loaded")
    
    attribution_extractor.set_model(extractor.model)
    
    if attribution_extractor.last_input is None:
        raise HTTPException(status_code=400, detail="No image processed. Upload an image first.")
    
    result = attribution_extractor.integrated_gradients(steps=request.steps)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/attribution/occlusion")
def compute_occlusion(request: OcclusionRequest = OcclusionRequest()):
    if extractor.model is None:
        raise HTTPException(status_code=400, detail="No model loaded")
    
    attribution_extractor.set_model(extractor.model)
    
    if attribution_extractor.last_input is None:
        raise HTTPException(status_code=400, detail="No image processed. Upload an image first.")
    
    result = attribution_extractor.occlusion(
        window_size=request.window_size,
        stride=request.stride
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result
