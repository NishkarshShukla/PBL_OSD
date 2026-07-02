#  Architecture & Design

This document describes the technical architecture : how the components fit together, why certain design decisions were made, and how data flows through the system end to end.

---

## System Overview
this has two independent processes that talk to each other over HTTP:

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│   ┌─────────────┐     ┌──────────────────────────────────┐  │
│   │   Drawing   │     │        Network Visualizer        │  │
│   │   Canvas    │     │  (SVG — neurons, edges, pixels)  │  │
│   └──────┬──────┘     └──────────────────────────────────┘  │
│          │ base64 PNG              ▲ activations + weights   │
│          ▼                        │                          │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              React App (Vite + Tailwind)             │  │
│   │         usePrediction hook / useArchitecture hook    │  │
│   └───────────────────────┬──────────────────────────────┘  │
└───────────────────────────│──────────────────────────────────┘
                            │ HTTP (localhost:8000)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│                                                             │
│   POST /predict          GET /architecture                  │
│   GET /random-test-digit GET /                              │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                  inference.py                        │  │
│   │   base64 decode → PIL → resize 28×28 → normalize     │  │
│   │   → PyTorch tensor → forward_with_activations()      │  │
│   └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│   ┌──────────────────────▼───────────────────────────────┐  │
│   │              NeuroLensNet (PyTorch)                  │  │
│   │           784 → 16 → 16 → 10 (softmax)              │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Neural Network Architecture

### Why this specific shape?

The network uses a deliberately small architecture: **784 → 16 → 16 → 10**.

This is the exact architecture from 3Blue1Brown's "But what is a neural network?" video — chosen here for the same reason he chose it: every single neuron and every connection can be rendered on screen without the diagram collapsing into an unreadable mass of overlapping lines. A standard production MNIST network (e.g. a CNN with hundreds of filters) would be impossible to visualize meaningfully at the neuron level.

Despite being small, this architecture reliably achieves **96–97% accuracy on MNIST's test set** — more than sufficient for a visualizer demo.

### Layer breakdown

| Layer | Input | Output | Activation | Purpose |
|-------|-------|--------|------------|---------|
| `fc1` | 784 | 16 | ReLU | Compress 28×28 pixel values into 16 learned features |
| `fc2` | 16 | 16 | ReLU | Further abstraction — second hidden layer |
| `fc3` | 16 | 10 | Softmax | One score per digit class (0–9), normalized to probabilities |

### Training

- **Dataset:** MNIST (60,000 training images, 10,000 test images)
- **Optimizer:** Adam (lr = 1e-3)
- **Loss:** CrossEntropyLoss
- **Epochs:** 8
- **Batch size:** 64

The trained weights are committed to `backend/model_weights/mnist_model.pth` so the app runs immediately after cloning without retraining.

### `forward_with_activations()`

The model exposes a second forward method alongside the standard `forward()`:

```python
def forward_with_activations(self, x):
    a1 = torch.relu(self.fc1(x))
    a2 = torch.relu(self.fc2(a1))
    logits = self.fc3(a2)
    probs = torch.softmax(logits, dim=1)
    return {
        "input": x,
        "hidden1": a1,
        "hidden2": a2,
        "output": probs,
    }
```

This is the method `/predict` calls. The extra activation tensors are what allow the frontend to light up each neuron individually based on its real value — without this, the visualizer would just be a static diagram.

---

## Backend

### File responsibilities

```
backend/
├── app/
│   ├── main.py         # FastAPI app instance, route definitions, CORS middleware
│   ├── model.py        # NeuroLensNet class (architecture + forward methods)
│   ├── inference.py    # Image decoding, preprocessing, model loading, get_architecture()
│   └── schemas.py      # Pydantic request/response models
└── training/
    └── train.py        # Standalone training script — downloads MNIST, trains, saves .pth
```

### API design

Four endpoints, two patterns:

**Static data (fetched once on app load):**
- `GET /architecture` — returns the full weight matrices and biases for all three layers. The frontend uses this to draw the initial graph structure and color edges before any drawing happens.

**Per-inference data (fetched every time the user finishes drawing):**
- `POST /predict` — accepts a base64-encoded PNG, preprocesses it, runs `forward_with_activations()`, returns the predicted digit, confidence score, and per-layer activation arrays.
- `GET /random-test-digit` — fetches a random image from MNIST's test split (not the training set) and returns it alongside its true label. Used for the "Try Random Test Digit" demo feature.

### Image preprocessing pipeline

The canvas drawing goes through these steps before hitting the model:

```
Canvas (280×280, black stroke on white) 
  → base64 PNG string
  → base64 decode → PIL Image → convert to grayscale ("L" mode)
  → resize to 28×28 (LANCZOS resampling)
  → invert pixel values (255 - x): dark stroke on white → bright digit on black, matching MNIST format
  → normalize to [0, 1] (divide by 255)
  → convert to PyTorch tensor [1, 1, 28, 28]
  → forward_with_activations()
```

The `invert` flag on `/predict` controls whether the inversion step runs. It's `True` for user drawings (dark stroke on white canvas) and `False` for MNIST test images (already white digit on black).

---

## Frontend

### File responsibilities

```
frontend/src/
├── components/
│   ├── DrawingCanvas.jsx       # Canvas element, mouse/touch handlers, exposes loadExternalImage() via ref
│   ├── NetworkVisualizer.jsx   # SVG diagram — pixel grid, edges, neurons, animation
│   ├── ProbabilityBars.jsx     # Confidence bar chart for all 10 digit classes
│   └── PredictionDisplay.jsx  # Predicted digit, confidence %, true-label match badge
├── hooks/
│   ├── usePrediction.js        # Manages POST /predict fetch, result state, pulseId counter
│   └── useArchitecture.js      # Fetches GET /architecture once on mount
└── utils/
    ├── preprocessCanvas.js     # canvasToBase64(), isCanvasBlank()
    ├── getPixelGrid.js         # Downscales canvas to 28×28 float array for pixel grid display
    ├── fetchRandomDigit.js     # GET /random-test-digit fetch utility
    └── colors.js               # Manim color constants, weightToColor(), activationToFill()
```

### Data flow (single prediction cycle)

```
User lifts mouse/touch after drawing
  → stopDraw() in DrawingCanvas
  → canvasToBase64(canvas) → base64 PNG string
  → getPixelGrid(canvas) → float[784] array → passed to NetworkVisualizer (pixel grid display)
  → usePrediction.predict(base64)
      → POST /predict
      → { prediction, confidence, activations: { hidden1[16], hidden2[16], output[10] } }
      → setResult(data), setPulseId(id + 1)
  → NetworkVisualizer receives new activations + pulseId
      → setStage(0), cascade through stages 0→1→2→3 at 220ms intervals
      → each stage lights up the next layer and animates its outgoing edges
```

### Network Visualizer

The visualizer is written in raw SVG — no D3, no charting library. This was a deliberate choice: the diagram is structurally fixed (same number of neurons every render), so the overhead of a data-binding library isn't worth it, and raw SVG gives full control over exactly what gets animated and when.

**Layout constants:**
| Element | X position |
|---------|-----------|
| Pixel grid (28×28) | x = 30 |
| Hidden layer 1 (16 neurons) | x = 340 |
| Hidden layer 2 (16 neurons) | x = 560 |
| Output layer (10 neurons) | x = 780 |

**Color system (Manim palette):**
| Color | Hex | Used for |
|-------|-----|---------|
| Blue | `#58C4DD` | Positive weights |
| Red | `#FC6255` | Negative weights |
| Gold | `#FFD93B` | Winning output neuron |

Edge opacity and stroke width are both scaled to weight magnitude — strong weights are thick and bright, near-zero weights are thin and nearly invisible.

Neuron fill brightness is mapped to activation value using HSL: `hsl(205, 20%, ${12 + norm * 82}%)`, ranging from near-black (inactive) to near-white (fully active).

**Animation stages:**

| Stage | What happens | Duration |
|-------|-------------|---------|
| 0 | Funnel lines from pixel grid → hidden1 flow (dashflow animation) | 220ms |
| 1 | Hidden1 neurons light up, hidden1→hidden2 edges flow | 220ms |
| 2 | Hidden2 neurons light up, hidden2→output edges flow (winner path thicker/brighter) | 220ms |
| 3 | Output neurons light up, winner gets gold ring + expanding pulse animation | Held |

The `pulseId` counter in `usePrediction` increments on every new prediction. The visualizer `useEffect` watches it and resets to stage 0 whenever it changes, replaying the full cascade.

---

## Design Decisions

### Why PyTorch over TensorFlow?
Both would work. PyTorch is more common in academic ML courses at this level, and `forward_with_activations()` is easier to write cleanly as a method on a `nn.Module` subclass.

### Why FastAPI over TensorFlow.js (fully client-side)?
Running the model client-side via TF.js would eliminate the backend entirely. We chose a server-side approach because: (1) it keeps model code in Python where the team has more experience, (2) it produces a real REST API with testable endpoints, which is more representative of a real-world ML deployment, and (3) the `/architecture` endpoint's weight data is expensive to recompute — serving it from a backend makes it easy to cache.

### Why raw SVG over D3 or a charting library?
The network topology is fixed — the same 784→16→16→10 shape on every render, just with different fill/stroke values. D3's strength is binding dynamic data to dynamically added/removed DOM elements. Here, the elements never change — only their visual properties do. Raw SVG with React state is simpler, faster, and produces cleaner code for this use case.

### Why commit the model weights to the repo?
The trained `.pth` file for this architecture is approximately 50KB — trivially small. Committing it means anyone who clones the repo can run the full app immediately without a training step. For a much larger model this would be wrong (use Git LFS or a model registry), but at this scale it's the right call for a course project.

---

## Running Locally

See [`README.md`](../README.md) for full setup instructions.
