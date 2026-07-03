# Contributors

NeuroLens was built as part of the Open Source Development course (PBL) at JIIT Noida.

---

## Team

| Name | GitHub | Role | Responsibilities |
|------|--------|------|-----------------|
| Nishkarsh Shukla | [@NishkarshShukla](https://github.com/NishkarshShukla) | Backend & ML | Neural network architecture, MNIST training pipeline, FastAPI inference API, `/predict` `/architecture` `/random-test-digit` endpoints, project setup and repo initialization |
| Saksham Dixit | [@SaksshamDixit](https://github.com/SaksshamDixit) | Dataset & Repo Support | MNIST dataset integration, repository maintenance |
| Harry Chauhan | [@2501030343-png](https://github.com/2501030343-png) | Frontend — Input & Data Layer | Drawing canvas, touch support, base64 preprocessing, `usePrediction` hook, `useArchitecture` hook, random-digit fetch utility |
| Vidhi thapliyal | [@2501030343-png](https://github.com/2501030343-png) | Frontend — Visualization & UI | Network visualizer (SVG), probability bar chart, prediction display, Manim-style color system, staged animation engine |
| Harshda Puri | [@2501200094](https://github.com/2501200094) | Documentation & Repo Maintenance | README, architecture docs, CONTRIBUTING.md, CHANGELOG.md, GitHub Issues and Discussions management |

---

## Contribution Map

### Backend & ML - Nishkarsh Shukla
```
backend/app/model.py
backend/app/inference.py
backend/app/main.py
backend/app/schemas.py
backend/training/train.py
backend/model_weights/mnist_model.pth
backend/requirements.txt
```

### Dataset & Repo Support - Saksham Dixit
```
backend/dataset/
CHANGELOG.md
CONTRIBUTORS.md
```

### Frontend: Input & Data Layer - Harry Chauhan
```
frontend/src/components/DrawingCanvas.jsx
frontend/src/hooks/usePrediction.js
frontend/src/hooks/useArchitecture.js
frontend/src/utils/preprocessCanvas.js
frontend/src/utils/getPixelGrid.js
frontend/src/utils/fetchRandomDigit.js
```

### Frontend: Visualization & UI - Vidhi Thapiyal
```
frontend/src/components/NetworkVisualizer.jsx
frontend/src/components/ProbabilityBars.jsx
frontend/src/components/PredictionDisplay.jsx
frontend/src/utils/colors.js
frontend/src/App.jsx
frontend/src/index.css
```

### Documentation & Repo Maintenance - Harshda Puri
```
README.md
CONTRIBUTING.md
LICENSE
docs/architecture.md
```

---

> All contributions are verifiable through the repository's commit history and pull request log.
> Each team member contributed via their own GitHub account on a dedicated branch, merged into `main` via pull request.
