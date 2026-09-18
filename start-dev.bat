@echo off
echo Starting KhedutSaathi AI Development Environment...

npx concurrently ^
  "cd frontend && npm run dev" ^
  "cd backend && npm run dev" ^
  "cd backend\ai_engine && ..\..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000" ^
  "..\..\.venv\Scripts\python.exe -m uvicorn rag_system.src.api:app --reload --port 8001" ^
  "cd ai_models\yield_predictor && ..\..\.venv\Scripts\python.exe -m uvicorn app:app --reload --port 8002" ^
  "cd ai_models\crop_recommendation && ..\..\.venv\Scripts\python.exe -m uvicorn src.app:app --reload --port 8003" ^
  "cd ai_models\crop_disease && ..\..\.venv\Scripts\python.exe -m uvicorn src.main:app --reload --port 8004" ^
  --names "Frontend,Backend,AIEngine,RAG,Yield,CropRec,Disease" ^
  --prefix-colors "blue,green,magenta,yellow,cyan,white,red"
