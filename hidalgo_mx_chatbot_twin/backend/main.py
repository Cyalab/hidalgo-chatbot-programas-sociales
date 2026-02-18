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

app = FastAPI(title="HidalgoMX Chatbot API", description="Backend for the Social Security Chatbot Twin")

# CORS setup (allow frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global chatbot instance
chatbot_instance = None
UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

from rules_engine import RulesEngine

# ... (global/setup)
rules_engine = RulesEngine()

class UserContext(BaseModel):
    age: Optional[int] = None
    age_group: Optional[str] = None # "Adulto Mayor", "Joven", etc.
    region: Optional[str] = None # "Huasteca", "Zempola", etc.
    occupation: Optional[str] = None # "Ejidatario", etc.
    is_student: Optional[bool] = None
    parents_residence: Optional[str] = None
    children: Optional[int] = None
    
class ChatRequest(BaseModel):
    message: str
    model_name: str = "phi-2" # Options: "phi-2", "socialite-llama"
    user_context: Optional[UserContext] = None

class ChatResponse(BaseModel):
    response: str
    source_documents: Optional[List[str]] = []

@app.on_event("startup")
async def startup_event():
    logger.info("Server starting up...")
    # Initialize chatbot with any existing PDFs if needed, or wait for upload
    pass

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    global chatbot_instance
    saved_files = []
    
    try:
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(file_path)
        
        # Re-initialize chatbot with new files
        # NOTE: In a real multi-user app, this should be handled per-session or background task
        logger.info(f"Initializing chatbot with {len(saved_files)} files...")
        chatbot_instance = ChatbotBackend(saved_files)
        
        return {"message": f"Successfully uploaded and processed {len(files)} files", "filenames": [f.filename for f in files]}
    except Exception as e:
        logger.error(f"Error calling upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    global chatbot_instance
    
    if not chatbot_instance:
         raise HTTPException(status_code=400, detail="No documents loaded. Please upload PDFs first.")
    
    try:
        # 1. Evaluate Priorities
        prioritized_programs = []
        if request.user_context:
            context_dict = request.user_context.dict(exclude_none=True)
            prioritized_programs = rules_engine.evaluate(context_dict)
            if prioritized_programs:
                logger.info(f"Prioritized Programs for user: {prioritized_programs}")

        # 2. Generate Response with Context
        response = chatbot_instance.answer_question(
            request.message, 
            model_name=request.model_name,
            prioritized_programs=prioritized_programs,
            is_advisor=request.is_advisor
        )
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}

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
