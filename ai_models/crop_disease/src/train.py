from src.dataset_loader import load_datasets
from src.model_builder import build_model
from src.trainer import ModelTrainer
from src.utils import save_classes
from src.config import CLASSES_SAVE_PATH

def main():
    print("Loading datasets...")
    train_loader, val_loader, classes = load_datasets()
    
    print(f"Found {len(classes)} classes: {classes}")
    save_classes(classes, CLASSES_SAVE_PATH)
    
    print("Building model...")
    model = build_model(len(classes))
    
    print("Starting training...")
    trainer = ModelTrainer(model, train_loader, val_loader)
    trainer.train()
    
    print("Training complete.")

if __name__ == "__main__":
    main()
