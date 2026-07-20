# KhedutSaathi

KhedutSaathi is a farmer-first agricultural SaaS platform leveraging AI to improve Crop Health, Crop Planning, Market Access, and Decision Making.

## Technology Stack
- **Frontend**: React (Vite) on Node.js
- **Backend**: Node.js (Express)
- **AI Engine**: Python 3.11, PyTorch (CUDA supported)
- **Knowledge Base (RAG)**: ChromaDB
- **LLM**: Groq API (`llama-3.1-8b-instant`)

## Architecture
- **Web App**: React application running on port 5173
- **Node API**: Backend service running on port 5000
- **AI Core**: Python AI Engine running on port 8000
- **RAG Service**: Knowledge retrieval service running on port 8001

## Setup & Deployment

1. **Install Dependencies**
   - Node: Run `npm install` in both `frontend` and `backend` directories.
   - Python: Ensure you are using **Python 3.11**. Create a virtual environment (`python -m venv .venv`) and install requirements (`pip install -r rag_system/requirements.txt` and AI engine requirements).

2. **Environment Variables**
   - Copy `.env.example` to `.env` in the root directory.
   - Obtain a Groq API Key and set `GROQ_API_KEY=your_key_here`.

3. **Running the Application**
   - Use the provided `./start-dev.bat` (or `.ps1`) to launch all servers simultaneously.

## Environment Verification
If you experience issues with the AI pipeline, run the included verification script to check your Python/CUDA environment, RAG connectivity, and API Keys:

```powershell
.\scripts\verify_env.ps1
```
