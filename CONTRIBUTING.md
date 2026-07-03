# Contributing to NeuroLens

Thanks for being part of this project. This document covers everything you need to know to contribute correctly — branching, commits, PRs, and issue tracking.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/NishkarshShukla/PBL_OSD.git
cd PBL_OSD
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv

# Activate virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

### 3. Set up the frontend

Open a new terminal (keep backend running separately):

```bash
cd frontend
npm install
npm run dev
```

### 4. Run the backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.
Visit `http://localhost:8000/docs` to test API endpoints directly via Swagger UI.

---

## Branching Rules

**Never push directly to `main`.** All work goes through a branch and a pull request — no exceptions.

Name your branch based on what it does:

| Type | Format | Example |
|------|--------|---------|
| New feature | `feature/<description>` | `feature/network-visualizer` |
| Bug fix | `fix/<description>` | `fix/canvas-touch-bug` |
| Documentation | `docs/<description>` | `docs/readme-update` |
| Dataset / data | `data/<description>` | `data/mnist-files` |

```bash
# create and switch to your branch
git checkout -b feature/your-feature-name

# push it to GitHub when ready
git push -u origin feature/your-feature-name
```

---

## Commit Messages

Keep commits small, focused, and descriptive. One logical change per commit.

**Good:**
```
Add probability bar chart component
Fix CORS issue in FastAPI backend
Add MNIST dataset files
Update README with API endpoint docs
```

**Bad:**
```
update
fix stuff
changes
wip
```

If a commit closes a GitHub Issue, reference it in the message:
```
Add drawing canvas with touch support

Closes #3
```

---

## Pull Request Workflow

1. Push your branch to GitHub
2. Go to the repo on GitHub — you'll see a **"Compare & pull request"** banner, click it
3. Write a short description of what the PR does
4. Reference any related Issues (e.g. `Closes #4`)
5. At least one other team member should review before merging where possible
6. Click **Merge pull request** once it's ready

The PR is what makes your contribution visible in the repo history — this is how everyone's work gets credited correctly.

---

## Issues

GitHub Issues are how we track tasks on this project.

- Before starting work, check if an Issue already exists for it
- If not, create one with a clear title (e.g. "Add probability bar chart")
- Assign yourself to the Issue you're working on
- When you open a PR for it, reference the Issue number in the PR description (`Closes #N`)

This keeps the commit graph clean and makes it obvious what each PR was for.

---

## Project Structure

```
PBL_OSD/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI routes
│   │   ├── model.py           # Network architecture
│   │   ├── inference.py       # Preprocessing + forward pass
│   │   └── schemas.py         # Pydantic models
│   ├── training/
│   │   └── train.py           # MNIST training script
│   ├── dataset/               # MNIST dataset files
│   ├── model_weights/         # Trained .pth file
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Helper functions
│   │   └── App.jsx
│   └── package.json
│
├── docs/
│   └── architecture.md
```

**Rule of thumb:** only touch files inside your assigned area. If you need to change something outside your area, discuss it first or open a separate PR so it doesn't create conflicts.

---

## Code Style

**Frontend:**
- React functional components only (no class components)
- Tailwind CSS for all styling — no inline styles or separate CSS files unless necessary
- One component per file, named the same as the file (`NetworkVisualizer.jsx` exports `NetworkVisualizer`)
- Keep components focused on one responsibility — logic goes in hooks, not components

**Backend:**
- Keep model, training, inference, and API logic in separate files — don't collapse everything into `main.py`
- Use Pydantic schemas for all request and response bodies
- Type-hint function signatures

---

## Questions

If something's unclear or you're stuck, open a GitHub Discussion rather than pushing a guess and hoping for the best. It's faster than fixing a broken merge later.
