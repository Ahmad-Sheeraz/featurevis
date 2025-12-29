import torch
import base64
import io
import numpy as np
from PIL import Image
from torchvision import transforms


def preprocess_image(
    image: Image.Image,
    input_size: int = 224,
    mean: list = None,
    std: list = None
) -> torch.Tensor:
    if mean is None:
        mean = [0.485, 0.456, 0.406]
    if std is None:
        std = [0.229, 0.224, 0.225]
    
    transform = transforms.Compose([
        transforms.Resize((input_size, input_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std)
    ])
    
    tensor = transform(image)
    tensor = tensor.unsqueeze(0)
    
    return tensor


def activation_to_base64(activation: torch.Tensor, channel: int = 0) -> str:
    act = activation[0, channel].numpy()
    
    act_min = act.min()
    act_max = act.max()
    if act_max - act_min > 0:
        act = (act - act_min) / (act_max - act_min)
    else:
        act = np.zeros_like(act)
    
    act = (act * 255).astype(np.uint8)
    
    img = Image.fromarray(act, mode='L')
    img = img.resize((112, 112), Image.BILINEAR)
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def activations_to_base64_batch(activation: torch.Tensor) -> list:
    num_channels = activation.shape[1]
    results = []
    
    for i in range(num_channels):
        results.append({
            "channel": i,
            "image": activation_to_base64(activation, i)
        })
    
    return results
