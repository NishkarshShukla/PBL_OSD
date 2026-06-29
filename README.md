# PBL_OSD

## About
Real-Time Neural Network  Visualization for Handwritten Character Recognition

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
   
