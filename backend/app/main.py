from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router
from app.routes.layers import router as layers_router
from app.routes.activations import router as activations_router
from app.routes.model import router as model_router
from app.routes.attribution import router as attribution_router
from app.services.hook_extractor import extractor

app = FastAPI(title="FeatureVis API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

extractor.load_model("resnet18")

app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(layers_router, prefix="/api", tags=["layers"])
app.include_router(activations_router, prefix="/api", tags=["activations"])
app.include_router(model_router, prefix="/api", tags=["models"])
app.include_router(attribution_router, prefix="/api", tags=["attribution"])


@app.get("/")
def root():
    return {"status": "running", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
