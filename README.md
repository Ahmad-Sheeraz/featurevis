# FeatureVis

Interactive CNN feature map visualization and attribution tool.

Existing explainability tools work, but they're slow to set up. For something as fundamental as "what did my model actually learn?" — that friction shouldn't exist.

FeatureVis does one thing: let you see inside your trained model instantly. Upload a model, upload an image, explore. No config files, no boilerplate, no waiting.

The goal is simple — verify your model is truly generalizing, not exploiting shortcuts.

## Project Structure
```
featurevis/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   └── services/
│   ├── pyproject.toml
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    └── package.json
```

## Setup

### Backend

**With uv (recommended): uv is really fast and reliable, i love it, and if you did not use it before, it is your time to add this to your python workflow**

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

**With pip:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Linux/Mac

pip install -r requirements.txt
uvicorn app.main:app --reload
```

**With conda:**
```bash
cd backend
conda create -n featurevis python=3.11
conda activate featurevis

pip install -r requirements.txt
uvicorn app.main:app --reload
```

**For GPU (CUDA), install PyTorch first:**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

Backend runs on http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Features

### Activations (What did the model see?)
- View activation maps for any Conv2d layer
- See which filters fired for your image
- Understand what patterns each layer detects

### Attribution (Why did it predict this?)
- **GradCAM**: Which regions influenced the prediction
- **Guided GradCAM**: Finer-grained GradCAM
- **Saliency**: Which pixels matter most
- **Integrated Gradients**: Accumulated importance
- **Occlusion**: What happens when regions are masked

### Custom Models
- Upload your own `.pt` or `.pth` model files
- Configure input size (default: 224×224)
- Set custom normalization (mean/std)
- Select architecture (ResNet-18, ResNet-50, VGG-16)

## Usage

1. Start backend
2. Start frontend
3. Open http://localhost:5173
4. Select model (pretrained or upload custom)
5. Upload an image
6. Click layers to view activations
7. Use attribution panel to see why the model made its prediction

## Custom Model Upload

To upload your own model:

1. Click the model dropdown in the sidebar
2. Click "Custom Model" to expand options
3. Select the base architecture your model uses
4. Set input size if different from 224
5. Adjust normalization values if not using ImageNet stats
6. Click "Upload .pt / .pth file" and select your model

Supported formats:
- Full model saved with `torch.save(model, path)`
- State dict saved with `torch.save(model.state_dict(), path)`