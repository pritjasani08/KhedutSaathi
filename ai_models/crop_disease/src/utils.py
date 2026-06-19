import json
import torch
import os
from config import MODEL_SAVE_DIR

def save_classes(classes, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(classes, f, indent=4)

def load_classes(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)

def get_device():
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")
