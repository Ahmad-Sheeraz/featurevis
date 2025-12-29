from fastapi import APIRouter, HTTPException

from app.services.hook_extractor import extractor
from app.services.image_processor import activations_to_base64_batch, activation_to_base64

router = APIRouter()


@router.get("/activations/{layer_name}")
def get_activations(layer_name: str, channel: int = None):
    activation = extractor.get_activation(layer_name)
    
    if activation is None:
        raise HTTPException(status_code=404, detail="Layer not found or no image processed")
    
    shape = list(activation.shape)
    
    if channel is not None:
        if channel < 0 or channel >= shape[1]:
            raise HTTPException(status_code=400, detail="Channel out of range")
        return {
            "layer": layer_name,
            "channel": channel,
            "shape": shape,
            "image": activation_to_base64(activation, channel),
        }
    
    return {
        "layer": layer_name,
        "shape": shape,
        "num_channels": shape[1],
        "activations": activations_to_base64_batch(activation),
    }


@router.get("/activations/{layer_name}/stats")
def get_activation_stats(layer_name: str):
    activation = extractor.get_activation(layer_name)
    
    if activation is None:
        raise HTTPException(status_code=404, detail="Layer not found or no image processed")
    
    return {
        "layer": layer_name,
        "shape": list(activation.shape),
        "mean": float(activation.mean()),
        "std": float(activation.std()),
        "min": float(activation.min()),
        "max": float(activation.max()),
    }
