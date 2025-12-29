from fastapi import APIRouter

from app.services.hook_extractor import extractor

router = APIRouter()


@router.get("/layers")
def get_layers():
    return {
        "layers": extractor.get_layer_names(),
        "info": extractor.get_layer_info(),
    }
