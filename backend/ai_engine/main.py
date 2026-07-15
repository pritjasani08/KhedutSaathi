from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv(dotenv_path="../.env") # Load from root before importing routes
from .routes import router
from .notification_routes import router as notification_router

app = FastAPI(title="KhedutSaathi AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Node.js backend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/ai")
app.include_router(notification_router, prefix="/api/ai")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
