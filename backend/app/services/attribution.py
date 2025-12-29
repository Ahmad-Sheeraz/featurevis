import torch
import numpy as np
import base64
import io
from PIL import Image
from captum.attr import (
    GradientShap,
    IntegratedGradients,
    GuidedGradCam,
    LayerGradCam,
    Saliency,
    Occlusion,
    NoiseTunnel,
)


class AttributionExtractor:
    def __init__(self):
        self.model = None
        self.last_input = None
        self.last_target = None

    def set_model(self, model):
        self.model = model
        self.model.eval()

    def set_input(self, tensor: torch.Tensor, target: int = None):
        self.last_input = tensor.clone()
        self.last_input.requires_grad = True
        self.last_target = target

    def _get_target(self):
        if self.last_target is not None:
            return self.last_target
        with torch.no_grad():
            output = self.model(self.last_input)
            return output.argmax(dim=1).item()

    def _normalize_attribution(self, attr: torch.Tensor) -> np.ndarray:
        attr = attr.squeeze().cpu().detach().numpy()
        
        if len(attr.shape) == 3:
            attr = np.mean(attr, axis=0)
        
        attr = np.abs(attr)
        
        if attr.max() > 0:
            attr = attr / attr.max()
        
        return attr

    def _attribution_to_base64(self, attr: np.ndarray, size: int = 224) -> str:
        attr = (attr * 255).astype(np.uint8)
        img = Image.fromarray(attr, mode='L')
        img = img.resize((size, size), Image.BILINEAR)
        
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')

    def _heatmap_to_base64(self, attr: np.ndarray, size: int = 224) -> str:
        from matplotlib import cm
        
        colored = cm.jet(attr)[:, :, :3]
        colored = (colored * 255).astype(np.uint8)
        
        img = Image.fromarray(colored, mode='RGB')
        img = img.resize((size, size), Image.BILINEAR)
        
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')

    def gradcam(self, layer_name: str) -> dict:
        if self.model is None or self.last_input is None:
            return {"error": "No model or input set"}
        
        target_layer = None
        for name, module in self.model.named_modules():
            if name == layer_name:
                target_layer = module
                break
        
        if target_layer is None:
            return {"error": f"Layer {layer_name} not found"}
        
        gradcam = LayerGradCam(self.model, target_layer)
        target = self._get_target()
        
        attr = gradcam.attribute(self.last_input, target=target)
        attr = torch.nn.functional.interpolate(
            attr, size=(224, 224), mode='bilinear', align_corners=False
        )
        
        attr_normalized = self._normalize_attribution(attr)
        
        return {
            "method": "gradcam",
            "layer": layer_name,
            "target_class": target,
            "attribution": self._attribution_to_base64(attr_normalized),
            "heatmap": self._heatmap_to_base64(attr_normalized),
        }

    def saliency(self) -> dict:
        if self.model is None or self.last_input is None:
            return {"error": "No model or input set"}
        
        saliency = Saliency(self.model)
        target = self._get_target()
        
        attr = saliency.attribute(self.last_input, target=target)
        attr_normalized = self._normalize_attribution(attr)
        
        return {
            "method": "saliency",
            "target_class": target,
            "attribution": self._attribution_to_base64(attr_normalized),
            "heatmap": self._heatmap_to_base64(attr_normalized),
        }

    def integrated_gradients(self, steps: int = 50) -> dict:
        if self.model is None or self.last_input is None:
            return {"error": "No model or input set"}
        
        ig = IntegratedGradients(self.model)
        target = self._get_target()
        
        baseline = torch.zeros_like(self.last_input)
        attr = ig.attribute(self.last_input, baselines=baseline, target=target, n_steps=steps)
        attr_normalized = self._normalize_attribution(attr)
        
        return {
            "method": "integrated_gradients",
            "target_class": target,
            "steps": steps,
            "attribution": self._attribution_to_base64(attr_normalized),
            "heatmap": self._heatmap_to_base64(attr_normalized),
        }

    def occlusion(self, window_size: int = 15, stride: int = 8) -> dict:
        if self.model is None or self.last_input is None:
            return {"error": "No model or input set"}
        
        occlusion = Occlusion(self.model)
        target = self._get_target()
        
        attr = occlusion.attribute(
            self.last_input,
            target=target,
            sliding_window_shapes=(3, window_size, window_size),
            strides=(3, stride, stride),
        )
        attr_normalized = self._normalize_attribution(attr)
        
        return {
            "method": "occlusion",
            "target_class": target,
            "window_size": window_size,
            "stride": stride,
            "attribution": self._attribution_to_base64(attr_normalized),
            "heatmap": self._heatmap_to_base64(attr_normalized),
        }

    def guided_gradcam(self, layer_name: str) -> dict:
        if self.model is None or self.last_input is None:
            return {"error": "No model or input set"}
        
        target_layer = None
        for name, module in self.model.named_modules():
            if name == layer_name:
                target_layer = module
                break
        
        if target_layer is None:
            return {"error": f"Layer {layer_name} not found"}
        
        guided_gc = GuidedGradCam(self.model, target_layer)
        target = self._get_target()
        
        attr = guided_gc.attribute(self.last_input, target=target)
        attr_normalized = self._normalize_attribution(attr)
        
        return {
            "method": "guided_gradcam",
            "layer": layer_name,
            "target_class": target,
            "attribution": self._attribution_to_base64(attr_normalized),
            "heatmap": self._heatmap_to_base64(attr_normalized),
        }


attribution_extractor = AttributionExtractor()
