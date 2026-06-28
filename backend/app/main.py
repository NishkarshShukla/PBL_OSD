from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import PredictRequest, PredictResponse, ArchitectureResponse, RandomDigitResponse
from .inference import run_inference, get_architecture, get_random_test_sample

app = FastAPI(title="NeuroLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "NeuroLens API is running"}


@app.get("/architecture", response_model=ArchitectureResponse)
def architecture():
    return get_architecture()


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    return run_inference(request.image, invert=request.invert)


@app.get("/random-test-digit", response_model=RandomDigitResponse)
def random_test_digit():
    """Returns a real MNIST test image + true label, for quick demos without drawing."""
    return get_random_test_sample()