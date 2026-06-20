import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.inference import DiseasePredictor

app = FastAPI(title="Crop Disease Detection API", description="API for detecting crop diseases from images")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor instance
predictor = None

@app.on_event("startup")
def load_model():
    global predictor
    try:
        predictor = DiseasePredictor()
        print("Crop Disease Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.get("/")
def read_root():
    return {
        "status": "running",
        "service": "crop_disease_detection"
    }

@app.post("/api/crop-disease/predict")
async def predict_disease(image: UploadFile = File(...)):
    if not predictor:
        raise HTTPException(status_code=500, detail="Model is currently unavailable")
        
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    # Save the uploaded file temporarily
    temp_path = f"temp_{image.filename}"
    try:
        content = await image.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(content)
            
        # Run prediction
        result = predictor.predict_image(temp_path)
        
        # Add success flag as required
        response = {
            "success": True,
            **result
        }
        
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return response
    except Exception as e:
        # Cleanup on error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # This allows running the file directly with `python src/main.py`
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
