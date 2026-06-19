import torch
import torch.nn as nn
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

def build_model(num_classes):
    """
    Builds a MobileNetV3 Small model for crop disease classification.
    """
    # Load pretrained MobileNetV3 Small
    model = mobilenet_v3_small(weights=MobileNet_V3_Small_Weights.DEFAULT)
    
    # Replace the classifier head
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    
    return model
