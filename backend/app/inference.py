import os
import io
import base64
import random

import numpy as np
import torch
from PIL import Image
from torchvision import datasets

from .model import NeuroLensNet

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model_weights", "mnist_model.pth")

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model = NeuroLensNet()
_model.load_state_dict(torch.load(MODEL_PATH, map_location=_device))
_model.to(_device)
_model.eval()

_test_dataset = None


def _decode_base64_image(image_str: str) -> Image.Image:
    if "," in image_str:
        image_str = image_str.split(",", 1)[1]
    image_bytes = base64.b64decode(image_str)
    return Image.open(io.BytesIO(image_bytes)).convert("L")


def preprocess_image(image_str: str, invert: bool = True) -> torch.Tensor:
    img = _decode_base64_image(image_str).resize((28, 28), Image.LANCZOS)
    arr = np.array(img).astype(np.float32)
    if invert:
        arr = 255.0 - arr
    arr = arr / 255.0
    tensor = torch.tensor(arr, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
    return tensor.to(_device)


def run_inference(image_str: str, invert: bool = True) -> dict:
    tensor = preprocess_image(image_str, invert=invert)
    with torch.no_grad():
        result = _model.forward_with_activations(tensor)

    output_probs = result["output"].squeeze(0).cpu().tolist()
    return {
        "prediction": int(np.argmax(output_probs)),
        "confidence": float(max(output_probs)),
        "activations": {
            "hidden1": result["hidden1"].squeeze(0).cpu().tolist(),
            "hidden2": result["hidden2"].squeeze(0).cpu().tolist(),
            "output": output_probs,
        },
    }


def get_architecture() -> dict:
    sd = _model.state_dict()
    return {
        "layer_sizes": [784, 16, 16, 10],
        "weights": {
            "fc1": sd["fc1.weight"].cpu().tolist(),
            "fc2": sd["fc2.weight"].cpu().tolist(),
            "fc3": sd["fc3.weight"].cpu().tolist(),
        },
        "biases": {
            "fc1": sd["fc1.bias"].cpu().tolist(),
            "fc2": sd["fc2.bias"].cpu().tolist(),
            "fc3": sd["fc3.bias"].cpu().tolist(),
        },
    }


def _get_test_dataset():
    """
    Lazily loads MNIST's test split, downloading it if needed.
    Path assumes it lives alongside training/dataset (same place train.py used).
    """
    global _test_dataset
    if _test_dataset is None:
        dataset_path = os.path.join(os.path.dirname(__file__), "..", "training", "dataset")
        _test_dataset = datasets.MNIST(root=dataset_path, train=False, download=True)
    return _test_dataset


def get_random_test_sample() -> dict:
    """Grabs a real MNIST test image + its true label — used for instant demos with no drawing."""
    dataset = _get_test_dataset()
    idx = random.randint(0, len(dataset) - 1)
    img, label = dataset[idx]  # PIL image, white digit on black (raw MNIST format)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    return {"image": f"data:image/png;base64,{b64}", "true_label": int(label)}