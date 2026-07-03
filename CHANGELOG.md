# Changelog

All notable changes to NeuroLens are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

Planned for future versions:
- EMNIST support — extend classification to handwritten letters (A–Z)
- Step-through animation mode — advance the network cascade manually, one layer at a time (useful for presentations)
- Image upload input — drag and drop a photo of a handwritten digit instead of drawing
- Dark/light theme toggle

---

## [1.0.0] - 2026-06-27

First fully working end-to-end release.

### Added

**Backend**
- Feedforward neural network architecture: 784 → 16 → 16 → 10 (`backend/app/model.py`)
- `forward_with_activations()` method on the model — returns per-layer activations alongside the prediction, used to drive the visualizer
- MNIST training pipeline with Adam optimizer, CrossEntropyLoss, 8 epochs (`backend/training/train.py`)
- Trained model weights committed to repo (`backend/model_weights/mnist_model.pth`) so the app works out of the box after cloning, no retraining needed
- FastAPI application with four endpoints (`backend/app/main.py`):
  - `GET /` — health check
  - `GET /architecture` — returns layer sizes, real weights and biases (fetched once on app load to draw the static graph)
  - `POST /predict` — accepts base64 image, returns prediction, confidence, and per-layer activations
  - `GET /random-test-digit` — returns a random real MNIST test image + true label for instant demos
- Pydantic request/response schemas (`backend/app/schemas.py`)
- CORS middleware configured for Vite dev server (`http://localhost:5173`)
- MNIST dataset files added to repository (`backend/dataset/`)

**Frontend**
- React + Vite + Tailwind CSS v4 project scaffold
- Drawing canvas with mouse and touch support, 280×280px, sends base64 snapshot to `/predict` on mouse/touch release (`DrawingCanvas.jsx`)
- Canvas-to-28×28 pixel grid utility for the input visualization (`utils/getPixelGrid.js`)
- `usePrediction` hook — manages fetch state, result, loading, error, and a `pulseId` counter that triggers the visualizer's animation replay on each new prediction
- `useArchitecture` hook — fetches static graph data once on mount
- Network visualizer rendered in raw SVG — no charting library (`NetworkVisualizer.jsx`):
  - 28×28 input pixel grid (left side)
  - Decorative funnel lines from pixel grid into hidden layer 1
  - Real fc2 weights (hidden1 → hidden2) and fc3 weights (hidden2 → output) rendered as colored edges
  - Manim color palette: `#58C4DD` (blue, positive weights), `#FC6255` (red, negative weights), `#FFD93B` (gold, winner)
  - Edge opacity and stroke width scaled to weight magnitude
  - Neuron fill brightness scaled to activation value
  - Staged cascade animation — 4 stages at 220ms intervals: grid→h1 flow, h1 lit + h1→h2 flow, h2 lit + h2→output flow (winner path emphasized), output lit + gold pulse ring on winner neuron
  - CSS keyframe animations: `dashflow` (flowing edge dashes), `winnerPulse` (expanding gold ring on predicted digit)
- Probability bar chart — all 10 digit confidence scores, winner bar highlighted in gold (`ProbabilityBars.jsx`)
- Prediction display with confidence score; shows true-label match/miss badge when using random test digit mode (`PredictionDisplay.jsx`)
- "Try Random Test Digit" button — loads a real MNIST test image into the canvas via `loadExternalImage()` (exposed via `forwardRef`/`useImperativeHandle`), inverts colors to match the white-canvas/black-stroke drawing convention, then calls `/predict` automatically

**Repo / Documentation**
- `.gitignore` configured: excludes `venv/`, `node_modules/`, `backend/training/dataset/` (auto-downloaded), `.env`, OS/editor artifacts
- `README.md` — full setup instructions, API reference, project structure
- `CONTRIBUTING.md` — branching conventions, commit message style, PR workflow, issue tracking
- `CONTRIBUTORS.md` — team roles and GitHub handles
- `CHANGELOG.md` — this file
- `docs/architecture.md` — project architecture and design description
- `LICENSE` — MIT

---