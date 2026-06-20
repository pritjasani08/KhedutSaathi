import torch
import torch.nn as nn
import torch.optim as optim
import json
import os
from tqdm import tqdm
from src.config import EPOCHS, LEARNING_RATE, MODEL_SAVE_PATH, METRICS_SAVE_PATH
from src.utils import get_device

class ModelTrainer:
    def __init__(self, model, train_loader, val_loader):
        self.device = get_device()
        
        if self.device.type == "cuda":
            print(f"Using GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else self.device}")
        else:
            print("Using CPU")
            
        self.model = model.to(self.device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.AdamW(self.model.parameters(), lr=LEARNING_RATE)
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(self.optimizer, mode='min', patience=2)
        self.early_stopping_patience = 5
        
    def train(self):
        metrics = {"train_loss": [], "val_loss": [], "val_acc": []}
        best_val_loss = float('inf')
        patience_counter = 0
        
        for epoch in range(EPOCHS):
            self.model.train()
            running_loss = 0.0
            for inputs, labels in tqdm(self.train_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Train]"):
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
            
            self.scheduler.step(val_loss)
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                self.save_model()
            else:
                patience_counter += 1
                if patience_counter >= self.early_stopping_patience:
                    print(f"Early stopping triggered at epoch {epoch+1}")
                    break
                    
        self.save_metrics(metrics)
            
    def evaluate(self):
        self.model.eval()
        running_loss = 0.0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for inputs, labels in tqdm(self.val_loader, desc="[Validation]", leave=False):
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
        
    def save_model(self):
        os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
        torch.save(self.model.state_dict(), MODEL_SAVE_PATH)
        print(f"Model saved to {MODEL_SAVE_PATH}")
        
    def save_metrics(self, metrics):
        with open(METRICS_SAVE_PATH, 'w') as f:
            json.dump(metrics, f, indent=4)
        print(f"Metrics saved to {METRICS_SAVE_PATH}")
