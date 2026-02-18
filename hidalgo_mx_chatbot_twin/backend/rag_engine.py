import os
import re
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import torch
import gc
from dotenv import load_dotenv
from pdfminer.high_level import extract_text
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_huggingface import HuggingFacePipeline
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from huggingface_hub import login
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotBackend:
    def __init__(self, pdf_files: List[str]):
        """
        Initialize chatbot with multiple PDF files
        """
        self.pdf_files = [Path(pdf) for pdf in pdf_files]
        self.chunk_size = 500
        self.processed_files = set()
        self.vector_store = None
        self.embedding_model = None
        self.tokenizer = None
        self.pipe = None
        self.retriever = None
        self.prompt = None
        self.rag_chain = None
        self.current_model_name = "microsoft/phi-2" # Default

        self.load_environment()
        
        # Create offload directory if it doesn't exist
        os.makedirs("offload", exist_ok=True)
        
        self.initialize_components()

    def load_environment(self) -> None:
        load_dotenv()
        self.hf_token = os.environ.get('HF_TOKEN')
        if self.hf_token:
            login(self.hf_token)
        else:
            logger.warning("HF_TOKEN not found. Some models might not work.")

    @contextmanager
    def gpu_memory_management(self):
        try:
            yield
        finally:
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect()

    def clean_text(self, text: str) -> str:
        # Adapted cleaning logic
        patterns = [
            r'http\S+', r'Página\s*\d+\s*de\s*\d+', 
            r'^\s*$', r'\?'
        ]
        for pattern in patterns:
            text = re.sub(pattern, '', text, flags=re.MULTILINE)
        return re.sub(r'\n\s*\n', '\n\n', text)

    def extract_structure(self, pdf_path: Path) -> List[Dict[str, Any]]:
        try:
            with open(pdf_path, 'rb') as file:
                text = extract_text(file)
            cleaned_text = self.clean_text(text)
            # Simplified chunking for now - can enhance with the regex logic from original if needed
            return [{"contenido": cleaned_text, "source_document": pdf_path.name}]
        except Exception as e:
            logger.error(f"Error processing {pdf_path}: {e}")
            return []

    def process_documents(self) -> List[Document]:
        documents = []
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        
        total_files = len(self.pdf_files)
        logger.info(f"⏳ INICIANDO PROCESAMIENTO DE {total_files} DOCUMENTOS...")
        
        for i, pdf_path in enumerate(self.pdf_files):
            # Log progress every 10 files or first/last
            if i % 10 == 0 or i == total_files - 1:
                logger.info(f"📁 Progreso: {i+1}/{total_files} archivos procesados...")
            
            with self.gpu_memory_management():
                data = self.extract_structure(pdf_path)
                for item in data:
                    content = item["contenido"]
                    if not content: continue
                    
                    # Determine access level
                    is_restricted = "manual" in pdf_path.name.lower() or "operativo" in pdf_path.name.lower()
                    access_level = "advisor" if is_restricted else "public"
                    
                    # Use robust splitter
                    chunks = text_splitter.create_documents(
                        [content], 
                        metadatas=[{"source": item["source_document"], "access": access_level}]
                    )
                    documents.extend(chunks)
                
        logger.info(f"✅ Procesamiento completado. {len(documents)} fragmentos generados.")
        return documents

    def initialize_components(self, model_name: str = "microsoft/phi-2") -> None:
        try:
            with self.gpu_memory_management():
                logger.info("Initializing Embeddings...")
                self.embedding_model = HuggingFaceEmbeddings(
                    model_name="intfloat/multilingual-e5-small",
                    model_kwargs={'device': 'cpu'} 
                )

                logger.info(f"Initializing Model: {model_name}...")
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                
                # Setup pipeline with memory-efficient settings
                # Use float16 if possible to save VRAM/RAM
                dtype = torch.float16 if torch.cuda.is_available() else torch.float32
                
                self.pipe = pipeline(
                    "text-generation",
                    model=model_name,
                    torch_dtype=dtype,
                    device_map="auto",
                    model_kwargs={"offload_folder": "offload"},
                    max_new_tokens=512,
                    do_sample=True,
                    temperature=0.3,
                    return_full_text=False
                )

                self.setup_rag_chain()
                logger.info(f"Model {model_name} loaded successfully.")
        except Exception as e:
            logger.error(f"CRITICAL ERROR initializing components for {model_name}: {e}")
            # Ensure attributes exist even if loading failed
            self.pipe = None
            self.rag_chain = None
            raise # Re-raise to let the caller know it failed

    def setup_rag_chain(self) -> None:
        index_path = "faiss_index"
        
        # Try to load existing index if available
        if os.path.exists(index_path):
            logger.info("Loading existing FAISS index from disk...")
            try:
                self.vector_store = FAISS.load_local(
                    index_path, 
                    self.embedding_model,
                    allow_dangerous_deserialization=True
                )
                logger.info("FAISS index loaded successfully.")
            except Exception as e:
                logger.error(f"Error loading FAISS index: {e}")
                self.vector_store = None

        if not self.vector_store:
            logger.info("📦 Creando nuevo índice (etapa de aprendizaje de fragmentos)...")
            documents = self.process_documents()
            if not documents:
                logger.warning("No hay documentos para indexar.")
                return

            # Batch indexing to show progress
            batch_size = 500
            total_chunks = len(documents)
            
            # Initialize with first batch
            first_batch = documents[:batch_size]
            self.vector_store = FAISS.from_documents(first_batch, self.embedding_model)
            logger.info(f"🧠 Indexando: {min(batch_size, total_chunks)}/{total_chunks} fragmentos...")

            # Add remaining documents in batches
            for i in range(batch_size, total_chunks, batch_size):
                batch = documents[i : i + batch_size]
                self.vector_store.add_documents(batch)
                logger.info(f"🧠 Indexando: {min(i + batch_size, total_chunks)}/{total_chunks} fragmentos...")

            # Save the index for next time
            self.vector_store.save_local(index_path)
            logger.info(f"💾 Índice guardado en disco: {index_path}")

        template = """
        <|start_header_id|>system<|end_header_id|>
        Eres un asistente experto en programas sociales de Hidalgo, México.
        
        IMPORTANTE: 
        {priority_instruction}
        
        Contexto relevante de los documentos:
        {context}
        <|eot_id|><|start_header_id|>user<|end_header_id|>
        {question}
        <|eot_id|><|start_header_id|>assistant<|end_header_id|>
        """
        
        self.prompt = PromptTemplate(
            input_variables=["context", "question", "priority_instruction"],
            template=template
        )
        
        # Chain now expects 'context' to be passed in, not retrieved automatically
        if self.pipe:
            self.rag_chain = (
                self.prompt
                | HuggingFacePipeline(pipeline=self.pipe)
                | StrOutputParser()
            )
        else:
            logger.error("Cannot setup RAG chain: Model pipe is None.")
            self.rag_chain = None

    def reload_model_if_needed(self, new_model_name: str):
        if new_model_name != self.current_model_name:
            logger.info(f"Switching model from {self.current_model_name} to {new_model_name}...")
            # Clear invalid model name mapping if needed, or mapping friendly names to HF IDs
            hf_id = new_model_name
            if new_model_name == "socialite-llama":
                hf_id = "hlab/SocialiteLlama"
            elif new_model_name == "phi-2":
                hf_id = "microsoft/phi-2"
            
            self.current_model_name = new_model_name
            
            # Clean up old model safely
            self.pipe = None
            self.tokenizer = None
            with self.gpu_memory_management():
                pass
            
            # Re-initialize
            self.initialize_components(model_name=hf_id)

    def answer_question(self, question: str, model_name: str = "phi-2", prioritized_programs: List[str] = [], is_advisor: bool = False, user_info: Dict[str, Any] = {}) -> str:
        self.reload_model_if_needed(model_name)
        
        if not self.vector_store:
            return "El sistema no está listo. Por favor sube documentos primero."
            
        profile_summary = []
        if user_info.get("gender"): profile_summary.append(f"Sexo: {user_info['gender']}")
        if user_info.get("age_group"): profile_summary.append(f"Perfil: {user_info['age_group']}")
        if user_info.get("region"): profile_summary.append(f"Región: {user_info['region']}")
        
        demographic_context = f"PERFIL DEL USUARIO: {', '.join(profile_summary)}." if profile_summary else ""
        
        priority_msg = ""
        if prioritized_programs:
            priority_msg = f"ATENCIÓN: El usuario califica con prioridad para los siguientes programas: {', '.join(prioritized_programs)}. Asegúrate de mencionar si estos programas aparecen en el contexto y recomendarlos encarecidamente."
        
        if demographic_context:
            priority_msg = f"{demographic_context}\n{priority_msg}"
            
        # Dynamic Retrieval based on Role
        search_kwargs = {"k": 10}
        if not is_advisor:
             # Public users ONLY see 'public' docs. Advisors see everything (no filter).
             search_kwargs["filter"] = {"access": "public"}
        
        logger.info(f"Retrieving with filter: {search_kwargs.get('filter', 'None (Advisor Access)')}")
        docs = self.vector_store.similarity_search(question, **search_kwargs)
        context_str = "\n\n".join([d.page_content for d in docs])
            
        if not self.rag_chain:
            return "El modelo de IA no pudo cargarse debido a falta de memoria o un error técnico. Por favor, intenta usar un modelo más ligero (Phi-2) o reinicia el servidor."
            
        with self.gpu_memory_management():
            try:
                return self.rag_chain.invoke({
                    "question": question, 
                    "priority_instruction": priority_msg,
                    "context": context_str
                })
            except Exception as e:
                logger.error(f"Error during RAG chain invocation: {e}")
                return f"Error al generar respuesta: {str(e)}"
