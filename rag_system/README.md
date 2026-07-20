# KhedutSaathi Agricultural Knowledge Engine

## GPU Requirements
To run embedding generation on a GPU, you must have an NVIDIA GPU and install CUDA-enabled PyTorch.

1. Check your CUDA version by running `nvidia-smi`.
2. Install the compatible PyTorch version from the official PyTorch website (e.g., `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118`).

## CPU vs GPU Execution
The embedding engine automatically supports both CPU and GPU execution. By default, it will detect if CUDA is available and use it. If CUDA is not available or fails to initialize, it gracefully falls back to CPU.

## Environment Variables
The following environment variables can be configured in the `.env` file:

- `EMBEDDING_DEVICE`: Set the preferred device. 
  - `auto` (Default): Uses CUDA if available, else CPU.
  - `cuda`: Forces CUDA. Falls back to CPU if it fails.
  - `cpu`: Forces CPU-only mode.
- `EMBEDDING_BATCH_SIZE`: Sets the batch size for embedding generation. Default is 32 for GPU and 100 for CPU.

## Troubleshooting GPU Detection
If you expect the system to use GPU but it falls back to CPU:
- Check `tests/test_gpu.py` output. It prints diagnostics on startup.
- Ensure your installed PyTorch version matches your CUDA version (`python -c "import torch; print(torch.cuda.is_available())"`).
- Verify that your GPU is detected by the OS.

## Knowledge Management & Local Assets
To keep this repository lightweight and fast to clone, **runtime knowledge assets and large PDFs are intentionally NOT tracked by Git.**

### Adding Knowledge Documents
1. Place your agricultural PDF documents into their respective source directories:
   `rag_system/knowledge/documents/<Source>/`
   *(e.g., `rag_system/knowledge/documents/FAO/`)*
2. If a source directory doesn't exist, you can create it.

### Rebuilding the Vector Database
Once your local PDFs are placed in the `documents/` directory, run the ingestion pipeline to parse, chunk, and embed the text into the local ChromaDB:
```bash
python src/ingest_knowledge.py
```
This script will read the local PDFs, generate `.structure.json` caches, create metadata files, and rebuild the local `vector_db`.

### Ignored Directories
The following directories are explicitly ignored by Git and will remain local to your machine:
- `rag_system/knowledge/documents/**/*.pdf` (Your local PDFs)
- `rag_system/knowledge/documents/**/*.structure.json` (Parsed text structures)
- `rag_system/knowledge/downloads/` (Acquisition pipeline downloads)
- `rag_system/knowledge/metadata/` (Generated document metadata)
- `rag_system/knowledge/rejected/` (Failed or invalid documents)
- `rag_system/vector_db/` (The actual ChromaDB database)
