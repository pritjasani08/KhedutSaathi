from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Internal Schemas
class SourceMetadata(BaseModel):
    name: str
    type: str
    freshness: str
    url: Optional[str] = None

class CandidateDecision(BaseModel):
    id: str
    type: str # MARKET | WEATHER | DISEASE | YIELD | SCHEME | GENERAL
    title: str
    trigger: str
    priorityScore: float
    confidence: int
    expiresAt: str
    rawFacts: Dict[str, Any]

# API Schemas
class AIRequest(BaseModel):
    requestId: Optional[str] = None
    debugMode: Optional[bool] = False
    farmer_id: str
    profile: Dict[str, Any] = Field(default_factory=dict)
    memory: Optional[Dict[str, Any]] = None
    recent_decisions: Optional[List[Dict[str, Any]]] = None
    weather: Dict[str, Any] = Field(default_factory=dict)
    market: Dict[str, Any] = Field(default_factory=dict)
    yield_predictions: List[Dict[str, Any]] = Field(default_factory=list)
    disease_history: List[Dict[str, Any]] = Field(default_factory=list)
    crop_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    dataFreshness: Dict[str, str] = Field(default_factory=dict)

class Decision(BaseModel):
    id: str
    priority: str # "HIGH", "MEDIUM", "LOW"
    priorityScore: float
    type: str
    trigger: str
    title: str
    confidence: int
    expiresAt: str
    rawFacts: Dict[str, Any]
    reason: List[str]
    expectedImpact: str
    followUp: List[str]
    sources: List[SourceMetadata]
    personalization_factors: Optional[List[str]] = None

class AIResponse(BaseModel):
    status: str = "success"
    requestId: Optional[str] = None
    generatedAt: str = "Unknown"
    dataFreshness: Dict[str, str] = Field(default_factory=dict)
    summary: str
    topDecision: Optional[Decision] = None
    decisions: List[Decision] = Field(default_factory=list)
    error: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

class MLResults(BaseModel):
    recommendedCrops: List[str]
    bestCrop: str
    expectedYield: Optional[float] = None
    riskLevel: str

class PlannerRequest(BaseModel):
    requestId: str
    farmInfo: Dict[str, Any]
    memory: Optional[Dict[str, Any]] = None
    recent_decisions: Optional[List[Dict[str, Any]]] = None
    mlResults: MLResults
    weather: Optional[Dict[str, Any]] = None
    market: Optional[Dict[str, Any]] = None

class PlannerResponse(BaseModel):
    status: str = "success"
    requestId: str
    bestCrop: str
    expectedYield: Optional[float] = None
    riskLevel: str
    explanation: str
    actionPlan: List[str]
    alternatives: List[str]
    sources: List[SourceMetadata]
    personalization_factors: Optional[List[str]] = None

class NotificationCandidate(BaseModel):
    id: str
    type: str # 'WEATHER', 'MARKET', 'DISEASE', 'SCHEME', 'CROP_ADVISORY'
    title: str
    priority: str # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    trigger: str
    rawFacts: Dict[str, Any]
    expiresAt: str

class NotificationRequest(BaseModel):
    requestId: str
    farmer_id: str
    profile: Dict[str, Any] = Field(default_factory=dict)
    memory: Optional[Dict[str, Any]] = None
    recent_decisions: Optional[List[Dict[str, Any]]] = None
    candidates: List[NotificationCandidate] = Field(default_factory=list)

class NotificationExplained(BaseModel):
    id: str
    message: str
    priority: str
    type: str
    title: str
    expiresAt: str
    rawFacts: Dict[str, Any]
    sources: List[SourceMetadata]
    personalization_factors: Optional[List[str]] = None

class NotificationResponse(BaseModel):
    status: str = "success"
    requestId: str
    notifications: List[NotificationExplained] = Field(default_factory=list)
    error: Optional[str] = None
