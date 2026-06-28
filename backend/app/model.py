import torch
import torch.nn as nn

class NeuroLensNet(nn.Module):
    """
    Feedforward network for MNIST digit classification.
    Architecture: 784 -> 16 -> 16 -> 10
    Kept small on purpose so the visualizer can render every
    neuron and connection without it turning into an unreadable mess.
    """
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(28 * 28, 16)
        self.fc2 = nn.Linear(16, 16)
        self.fc3 = nn.Linear(16, 10)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        a1 = torch.relu(self.fc1(x))
        a2 = torch.relu(self.fc2(a1))
        return self.fc3(a2)

    def forward_with_activations(self, x):
        """
        Same as forward(), but returns every intermediate activation
        too — this is what the frontend visualizer will actually use
        to light up neurons and color edges.
        """
        x = x.view(x.size(0), -1)
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