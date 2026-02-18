import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import shutil
import logging
import json # Added json import
from rag_engine import ChatbotBackend
from rules_engine import RulesEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="HidalgoMX Chatbot API", description="Backend para Chatbot de programas sociales del estado de Hidalgo")

# CORS setup (allow frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global chatbot state
chatbot_instance = None
is_ready = False
initialization_error = None
UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ... (rest of setup)
rules_engine = RulesEngine()

class UserContext(BaseModel):
    age: Optional[int] = None
    age_group: Optional[str] = None # "Adulto Mayor", "Joven", etc.
    region: Optional[str] = None # "Huasteca", "Zempola", etc.
    occupation: Optional[str] = None # "Ejidatario", etc.
    gender: Optional[str] = None # "Hombre", "Mujer", "Otro"
    is_student: Optional[bool] = None
    parents_residence: Optional[str] = None
    children: Optional[int] = None
    
class ChatRequest(BaseModel):
    message: str
    model_name: str = "phi-2" # Options: "phi-2", "socialite-llama"
    user_context: Optional[UserContext] = None
    is_advisor: bool = False

class ChatResponse(BaseModel):
    response: str
    source_documents: Optional[List[str]] = []

async def initialize_chatbot():
    global chatbot_instance, is_ready, initialization_error
    try:
        from pathlib import Path
        existing_files = [str(p) for p in Path(UPLOAD_DIR).rglob("*.pdf")]
        if existing_files:
            logger.info(f"Found {len(existing_files)} existing files. Starting background initialization...")
            # Use threaded executor to avoid blocking the event loop for CPU-heavy tasks
            import asyncio
            import concurrent.futures
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as pool:
                chatbot_instance = await loop.run_in_executor(pool, lambda: ChatbotBackend(existing_files))
            
            is_ready = True
            logger.info("\n" + "="*50 + "\n¡ASISTENTE VIRTUAL LISTO PARA PREGUNTAS!\n" + "="*50)
        else:
            logger.info("No documents found to initialize. System ready but empty.")
            is_ready = True
    except Exception as e:
        initialization_error = str(e)
        is_ready = False
        logger.error(f"Error al inicializar el chatbot: {e}")

@app.on_event("startup")
async def startup_event():
    import asyncio
    logger.info("Server starting up...")
    # Fire and forget initialization
    asyncio.create_task(initialize_chatbot())

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    global chatbot_instance, is_ready
    saved_files = []
    
    try:
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(file_path)
        
        # Trigger re-initialization in background
        import asyncio
        is_ready = False
        asyncio.create_task(initialize_chatbot())
        
        return {"message": "Files uploaded. Optimization and indexing started in background.", "filenames": [f.filename for f in files]}
    except Exception as e:
        logger.error(f"Error calling upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    global chatbot_instance, is_ready
    
    if not is_ready:
         raise HTTPException(status_code=503, detail="El sistema se está inicializando (procesando 94 PDFs). Por favor, espera un momento y vuelve a intentarlo.")
    
    if not chatbot_instance:
         raise HTTPException(status_code=400, detail="No hay documentos cargados. Por favor sube PDFs primero.")
    
    try:
        # 1. Evaluate Priorities
        prioritized_programs = []
        if request.user_context:
            context_dict = request.user_context.dict(exclude_none=True)
            prioritized_programs = rules_engine.evaluate(context_dict)
            if prioritized_programs:
                logger.info(f"Prioritized Programs for user: {prioritized_programs}")

        # 2. Generate Response with Context
        user_info = request.user_context.dict(exclude_none=True) if request.user_context else {}
        response = chatbot_instance.answer_question(
            request.message, 
            model_name=request.model_name,
            prioritized_programs=prioritized_programs,
            is_advisor=request.is_advisor,
            user_info=user_info
        )
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"CRITICAL ERROR in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if is_ready else "initializing",
        "ready": is_ready,
        "error": initialization_error,
        "message": "Chatbot ready" if is_ready else "Chatbot is processing documents in background..."
    }

@app.post("/verify-key")
async def verify_key(key: str = Body(..., embed=True)):
    try:
        with open("advisor_keys.json", "r") as f:
            data = json.load(f)
            valid_keys = data.get("keys", [])
            
        if key in valid_keys:
            logger.info("Advisor key verified successfully.")
            return {"valid": True}
        else:
            logger.warning("Invalid advisor key attempt.")
            return {"valid": False}
    except Exception as e:
        logger.error(f"Error verifying key: {e}")
        return {"valid": False}
        
# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
