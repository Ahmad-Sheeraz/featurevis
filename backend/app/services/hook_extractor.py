import torch
import torchvision.models as models
import os


class HookExtractor:
    def __init__(self):
        self.model = None
        self.activations = {}
        self.hooks = []
        self.layer_info = {}
        self.model_name = None
        self.input_size = 224
        self.normalization = {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }

    def load_model(self, model_name: str = "resnet18"):
        self._clear_hooks()
        
        if model_name == "resnet18":
            self.model = models.resnet18(weights="DEFAULT")
        elif model_name == "resnet50":
            self.model = models.resnet50(weights="DEFAULT")
        elif model_name == "vgg16":
            self.model = models.vgg16(weights="DEFAULT")
        else:
            self.model = models.resnet18(weights="DEFAULT")
        
        self.model.eval()
        self.model_name = model_name
        self.input_size = 224
        self.normalization = {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }
        self._register_hooks()
        
        return list(self.layer_info.keys())

    def load_custom_model(
        self,
        model_path: str,
        input_size: int = 224,
        mean: list = None,
        std: list = None,
        architecture: str = None
    ):
        self._clear_hooks()
        
        if mean is None:
            mean = [0.485, 0.456, 0.406]
        if std is None:
            std = [0.229, 0.224, 0.225]
        
        try:
            if architecture:
                if architecture == "resnet18":
                    self.model = models.resnet18(weights=None)
                elif architecture == "resnet50":
                    self.model = models.resnet50(weights=None)
                elif architecture == "vgg16":
                    self.model = models.vgg16(weights=None)
                else:
                    self.model = models.resnet18(weights=None)
                
                state_dict = torch.load(model_path, map_location='cpu', weights_only=True)
                
                if 'state_dict' in state_dict:
                    state_dict = state_dict['state_dict']
                elif 'model_state_dict' in state_dict:
                    state_dict = state_dict['model_state_dict']
                elif 'model' in state_dict:
                    state_dict = state_dict['model']
                
                new_state_dict = {}
                for key, value in state_dict.items():
                    new_key = key.replace('module.', '')
                    new_state_dict[new_key] = value
                
                self.model.load_state_dict(new_state_dict, strict=False)
            else:
                loaded = torch.load(model_path, map_location='cpu', weights_only=False)
                
                if isinstance(loaded, torch.nn.Module):
                    self.model = loaded
                elif isinstance(loaded, dict):
                    raise ValueError("Model file contains state_dict only. Please specify architecture.")
                else:
                    self.model = loaded
            
            self.model.eval()
            self.model_name = os.path.basename(model_path)
            self.input_size = input_size
            self.normalization = {"mean": mean, "std": std}
            self._register_hooks()
            
            return {
                "success": True,
                "layers": list(self.layer_info.keys()),
                "input_size": self.input_size,
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _clear_hooks(self):
        for hook in self.hooks:
            hook.remove()
        self.hooks = []
        self.activations = {}
        self.layer_info = {}

    def _get_hook(self, name: str):
        def hook(module, input, output):
            self.activations[name] = output.detach()
        return hook

    def _register_hooks(self):
        for name, module in self.model.named_modules():
            if isinstance(module, torch.nn.Conv2d):
                hook = module.register_forward_hook(self._get_hook(name))
                self.hooks.append(hook)
                self.layer_info[name] = {
                    "type": "Conv2d",
                    "in_channels": module.in_channels,
                    "out_channels": module.out_channels,
                    "kernel_size": module.kernel_size,
                }

    def extract(self, image_tensor: torch.Tensor) -> dict:
        self.activations = {}
        
        with torch.no_grad():
            output = self.model(image_tensor)
            probs = torch.nn.functional.softmax(output, dim=1)
            top5_probs, top5_indices = torch.topk(probs, 5)
        
        return {
            "activations": self.activations,
            "predictions": {
                "top5_indices": top5_indices[0].tolist(),
                "top5_probs": top5_probs[0].tolist(),
            }
        }

    def get_layer_names(self) -> list:
        return list(self.layer_info.keys())

    def get_layer_info(self) -> dict:
        return self.layer_info

    def get_activation(self, layer_name: str):
        if layer_name in self.activations:
            return self.activations[layer_name]
        return None

    def get_model_info(self) -> dict:
        return {
            "name": self.model_name,
            "input_size": self.input_size,
            "normalization": self.normalization,
            "num_layers": len(self.layer_info),
        }


extractor = HookExtractor()
