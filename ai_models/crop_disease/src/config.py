import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Paths
DATASET_DIR = BASE_DIR / "merged_dataset"
TRAIN_DIR = DATASET_DIR / "train"
VALID_DIR = DATASET_DIR / "val"

MODEL_SAVE_DIR = BASE_DIR / "model"
MODEL_SAVE_PATH = MODEL_SAVE_DIR / "crop_disease_model.pth"
CLASSES_SAVE_PATH = MODEL_SAVE_DIR / "classes.json"
METRICS_SAVE_PATH = MODEL_SAVE_DIR / "training_metrics.json"

# Model Config
BATCH_SIZE = 16
LEARNING_RATE = 0.001
EPOCHS = 25
IMAGE_SIZE = (224, 224)
NUM_WORKERS = 4
