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
from langchain.text_splitter import RecursiveCharacterTextSplitter
from huggingface_hub import login
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from langchain.prompts import PromptTemplate
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
        
        for pdf_path in self.pdf_files:
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
                
        logger.info(f"Processed {len(self.pdf_files)} files into {len(documents)} chunks.")
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
                
                # Setup pipeline
                self.pipe = pipeline(
                    "text-generation",
                    model=model_name,
                    torch_dtype=torch.float32,
                    device_map="auto",
                    max_new_tokens=512,
                    do_sample=True,
                    temperature=0.3,
                    return_full_text=False
                )

                self.setup_rag_chain()
        except Exception as e:
            logger.error(f"Error initializing components: {e}")
            raise

    def setup_rag_chain(self) -> None:
        documents = self.process_documents()
        if not documents:
            logger.warning("No documents to index.")
            return

        self.vector_store = FAISS.from_documents(documents, self.embedding_model)
        # Note: We won't bake the retriever into the chain anymore to allow dynamic filtering

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
        self.rag_chain = (
            self.prompt
            | HuggingFacePipeline(pipeline=self.pipe)
            | StrOutputParser()
        )

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
            
            # Clean up old model to free VRAM
            del self.pipe
            del self.tokenizer
            with self.gpu_memory_management():
                pass
            
            # Re-initialize
            self.initialize_components(model_name=hf_id)

    def answer_question(self, question: str, model_name: str = "phi-2", prioritized_programs: List[str] = [], is_advisor: bool = False) -> str:
        self.reload_model_if_needed(model_name)
        
        if not self.vector_store:
            return "El sistema no está listo. Por favor sube documentos primero."
            
        priority_msg = ""
        if prioritized_programs:
            priority_msg = f"ATENCIÓN: El usuario califica con prioridad para los siguientes programas: {', '.join(prioritized_programs)}. Asegúrate de mencionar si estos programas aparecen en el contexto y recomendarlos encarecidamente."
            
        # Dynamic Retrieval based on Role
        search_kwargs = {"k": 10}
        if not is_advisor:
             # Public users ONLY see 'public' docs. Advisors see everything (no filter).
             search_kwargs["filter"] = {"access": "public"}
        
        logger.info(f"Retrieving with filter: {search_kwargs.get('filter', 'None (Advisor Access)')}")
        docs = self.vector_store.similarity_search(question, **search_kwargs)
        context_str = "\n\n".join([d.page_content for d in docs])
            
        with self.gpu_memory_management():
            return self.rag_chain.invoke({
                "question": question, 
                "priority_instruction": priority_msg,
                "context": context_str
            })
