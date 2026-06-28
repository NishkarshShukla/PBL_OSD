from pydantic import BaseModel
from typing import List, Dict


class PredictRequest(BaseModel):
    image: str
    invert: bool = True


class LayerActivations(BaseModel):
    hidden1: List[float]
    hidden2: List[float]
    output: List[float]


class PredictResponse(BaseModel):
    prediction: int
    confidence: float
    activations: LayerActivations


class ArchitectureResponse(BaseModel):
    layer_sizes: List[int]
    weights: Dict[str, List[List[float]]]
    biases: Dict[str, List[float]]


class RandomDigitResponse(BaseModel):
    image: str
    true_label: int