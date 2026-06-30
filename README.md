# PBL_OSD

## About
Real-Time Neural Network  Visualization for Handwritten Character RecognitionAn interactive, browser-based visualizer that shows you how a neural network "thinks" while it classifies handwritten digits — inspired by 3Blue1Brown's neural network explainer videos, but live and interactive.

Draw a digit on the canvas, and watch a real feedforward neural network light up in real time: neurons glow based on their actual activation values, connections are colored by their actual weight signs, and the predicted digit is revealed through an animated, staged cascade — not an instant snap.

## Features

- **Live drawing canvas** — draw any digit (0–9) with mouse or touch
- **Animated network visualization** — neurons and connections rendered with real model weights/activations, revealed in a staged cascade (input → hidden → hidden → output)
- **Manim-inspired aesthetic** — near-black background, signature blue/red weight coloring, gold winner highlight
- **Probability bar chart** — confidence breakdown across all 10 digit classes, not just the top guess
- **Random test digit mode** — pulls a real MNIST test image for instant demos without drawing, and checks the prediction against the true label

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS v4 |
| Backend | FastAPI (Python) |
| Model | PyTorch — feedforward NN trained on MNIST |
| Visualization | Raw SVG (no charting library) |

## Architecture

```
[Drawing Canvas] --base64 image--> [FastAPI /predict] --activations--> [Network Visualizer]
                                          |
                                   [PyTorch model]
                                   784 -> 16 -> 16 -> 10
```

The network is intentionally small (784 → 16 → 16 → 10) so every single neuron and connection can be rendered without the diagram becoming unreadable — the same scale 3Blue1Brown uses in his original video.

See [`docs/architecture.md`](docs/architecture.md) for a more detailed breakdown.

## Project Structure

```
PBL_OSD/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app and routes
│   │   ├── model.py           # Network architecture
│   │   ├── inference.py       # Preprocessing + forward pass
│   │   └── schemas.py         # Request/response models
│   ├── training/
│   │   └── train.py           # Trains the model on MNIST
│   ├── dataset/                # Versioned MNIST dataset files
│   ├── model_weights/
│   │   └── mnist_model.pth    # Trained weights
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/         # DrawingCanvas, NetworkVisualizer, ProbabilityBars, etc.
│   │   ├── hooks/               # usePrediction, useArchitecture
│   │   ├── utils/               # Preprocessing, color logic
│   │   └── App.jsx
│   └── package.json
│
├── docs/
│   └── architecture.md
│
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
└── CONTRIBUTORS.md
```

## Setup & Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/NishkarshShukla/PBL_OSD.git
cd PBL_OSD
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

### 3. Train the model

```bash
python training/train.py
```

This downloads MNIST automatically (first run only) and trains the network for a few epochs, saving weights to `model_weights/mnist_model.pth`. Expect ~96–97% test accuracy in a couple of minutes on CPU.

> If you cloned the repo and `model_weights/mnist_model.pth` already exists, you can skip this step — the model is committed to the repo so the app works out of the box.

### 4. Run the backend (FastAPI)

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` to confirm it's running — FastAPI provides an interactive Swagger UI where you can test endpoints directly.

### 5. Frontend setup

Open a **new terminal** (keep the backend running in the first one):

```bash
cd frontend
npm install
```

### 6. Run the frontend

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. Draw a digit and watch the network respond.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — confirms the API is running |
| `GET` | `/architecture` | Returns layer sizes, weights, and biases (fetched once on app load) |
| `POST` | `/predict` | Accepts a base64 image, returns prediction, confidence, and per-layer activations |
| `GET` | `/random-test-digit` | Returns a random real MNIST test image and its true label |

Example `/predict` request body:
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSU...",
  "invert": true
}
```

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branching conventions, commit message style, and the PR workflow we follow.

## Contributors

See [`CONTRIBUTORS.md`](CONTRIBUTORS.md) for the full team and role breakdown.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for version history.

## License

This project is licensed under the MIT License — see [`LICENSE`](LICENSE) for details.

## Acknowledgments

- Visualization style inspired by [3Blue1Brown's neural network series](https://www.3blue1brown.com/)
- Trained on the [MNIST](http://yann.lecun.com/exdb/mnist/) handwritten digit dataset


##Setup & Installation

Prerequisites

Python 3.10+
Node.js 18+
Git

1. Clone the repository
   git clone https://github.com/NishkarshShukla/PBL_OSD.git
   cd PBL_OSD

2. Backend setup
   cd backend
   python -m venv venv

   # Activate the virtual environment
   venv\Scripts\activate        # Windows
   source venv/bin/activate     # Mac/Linux
   pip install -r requirements.txt

3. Train the model
   python training/train.py

This downloads MNIST automatically (first run only) and trains the network for a few epochs, saving weights to model_weights/mnist_model.pth. Expect ~96–97% test accuracy in a couple of minutes on CPU.

(If you cloned the repo and model_weights/mnist_model.pth already exists, you can skip this step — the model is committed to the repo so the app works out of the box.)

4. Run the backend (FastAPI)
   uvicorn app.main:app --reload --port 8000
   
