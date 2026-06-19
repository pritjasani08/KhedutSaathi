import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

def build_model(num_classes):
    """
    Builds an EfficientNet-B0 model for crop disease classification.
    """
    # Load pretrained EfficientNet-B0
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
    
    # Replace the classifier head
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    
    return model
