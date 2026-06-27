import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.model import NeuroLensNet


def evaluate(model, loader, device):
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            preds = model(images).argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    return correct / total


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    transform = transforms.Compose([transforms.ToTensor()])

    train_data = datasets.MNIST(root="./dataset", train=True, download=True, transform=transform)
    test_data = datasets.MNIST(root="./dataset", train=False, download=True, transform=transform)

    train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
    test_loader = DataLoader(test_data, batch_size=256, shuffle=False)

    model = NeuroLensNet().to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    epochs = 8
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        acc = evaluate(model, test_loader, device)
        print(f"Epoch {epoch+1}/{epochs} - loss: {total_loss/len(train_loader):.4f} - test acc: {acc:.2%}")

    os.makedirs("../model_weights", exist_ok=True)
    torch.save(model.state_dict(), "../model_weights/mnist_model.pth")
    print("Saved weights to model_weights/mnist_model.pth")


if __name__ == "__main__":
    main()