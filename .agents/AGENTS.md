## Rule: Python Environment for AI/ML Modules

When working on Python backend services, AI engines, RAG components, or any module that depends on PyTorch, ChromaDB, or other machine learning libraries:

- Never use unsupported or experimental Python versions (e.g., Python 3.14) for project development. Verify that the selected Python version is officially supported by the project's PyTorch version before creating the environment.
- Prefer Python 3.11 as the project standard unless the project explicitly targets another supported version.
- Always use a dedicated project virtual environment (.venv). Do not install project dependencies into the global Python environment.
- Install all AI/ML dependencies inside the project's virtual environment.
- Install a PyTorch build that matches the project's requirements (CPU or CUDA) and the installed CUDA runtime where applicable.
- Before debugging application logic, verify the Python environment by confirming that the following succeeds:

  `ash
  python -c "import torch; print(torch.__version__)"
  `

- If PyTorch cannot be imported (for example, ImportError: DLL load failed while importing _C), treat it as an environment issue rather than an application bug.
- If the environment becomes incompatible due to a Python version change or corrupted dependencies:
  1. Remove the existing virtual environment.
  2. Create a new virtual environment using the project's supported Python version.
  3. Reinstall all dependencies.
  4. Verify that PyTorch imports successfully before running ingestion, training, or RAG services.

No application-level debugging of RAG, embedding generation, ChromaDB, or Groq integration should begin until the Python environment has been verified as healthy.
