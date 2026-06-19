import torch
import torch.nn as nn
import torch.optim as optim
import json
import os
from config import EPOCHS, LEARNING_RATE, MODEL_SAVE_PATH, METRICS_SAVE_PATH
from utils import get_device

class ModelTrainer:
    def __init__(self, model, train_loader, val_loader):
        self.device = get_device()
        self.model = model.to(self.device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=LEARNING_RATE)
        
    def train(self):
        metrics = {"train_loss": [], "val_loss": [], "val_acc": []}
        
        for epoch in range(EPOCHS):
            self.model.train()
            running_loss = 0.0
            for inputs, labels in self.train_loader:
                inputs, labels = inputs.to(self.device), labels.to(self.device)
                
                self.optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = self.criterion(outputs, labels)
                loss.backward()
                self.optimizer.step()
                
                running_loss += loss.item()
                
            train_loss = running_loss / len(self.train_loader)
            val_loss, val_acc = self.evaluate()
            
            print(f"Epoch {epoch+1}/{EPOCHS} - Train Loss: {train_loss:.4f} - Val Loss: {val_loss:.4f} - Val Acc: {val_acc:.4f}")
            
            metrics["train_loss"].append(train_loss)
            metrics["val_loss"].append(val_loss)
            metrics["val_acc"].append(val_acc)
            
        self.save_model(metrics)
            
    def evaluate(self):
        self.model.eval()
        running_loss = 0.0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for inputs, labels in self.val_loader:
                inputs, labels = inputs.to(self.device), labels.to(self.device)
                outputs = self.model(inputs)
                loss = self.criterion(outputs, labels)
                
                running_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
                
        val_loss = running_loss / len(self.val_loader)
        val_acc = correct / total
        return val_loss, val_acc
        
    def save_model(self, metrics):
        os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
        torch.save(self.model.state_dict(), MODEL_SAVE_PATH)
        
        with open(METRICS_SAVE_PATH, 'w') as f:
            json.dump(metrics, f, indent=4)
        print(f"Model saved to {MODEL_SAVE_PATH}")
