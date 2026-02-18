# HidalgoMX Chatbot Twin

**Sistema Gemelo de Asistencia en Programas Sociales**
Un asistente inteligente basado en RAG (Retrieval-Augmented Generation) y LLMs locales, diseñado para el Gobierno del Estado de Hidalgo.

## 🚀 Características
*   **Interfaz Moderna**: Diseño limpio y responsivo inspirado en "LLM Studio".
*   **Motor RAG Robusto**: Procesamiento inteligente de documentos PDF (120+ programas).
*   **Seguridad RBAC**: 
    *   **Modo Público**: Acceso restringido a información general.
    *   **Modo Asesor**: Acceso privilegiado a manuales operativos mediante autenticación segura.
*   **Priorización Inteligente**: Reglas dinámicas (`priority_rules.json`) para recomendar programas según la comunidad del ciudadano (Huasteca, Zempoala, etc.).
*   **Multi-Modelo**: Soporte para cambiar dinámicamente entre `Microsoft Phi-2` (rápido/CPU) y `Socialite-Llama` (experto/GPU).

## 🛠️ Tecnologías
*   **Backend**: Python, FastAPI, LangChain, HuggingFace Transformers, FAISS.
*   **Frontend**: TypeScript, Next.js, Tailwind CSS, Framer Motion.

## 📦 Instalación Rápida
Requisitos previos: Python 3.9+, Node.js 18+.

1.  **Clonar repositorio**:
    ```bash
    git clone https://github.com/cyalab/hidalgo-mx-chatbot.git
    cd hidalgo-mx-chatbot
    ```
2.  **Ejecutar Script de Inicio**:
    *   En Windows: Doble clic en `run_chatbot.bat`.
    *   Esto instalará dependencias y levantará ambos servidores.

## 🔐 Configuración de Seguridad
*   **Token de HuggingFace**: Crea un archivo `backend/.env` con `HF_TOKEN=tu_token`.
*   **Claves de Asesor**: Gestionadas en `backend/advisor_keys.json`.

## 📄 Documentación Adicional
*   [Manual Técnico de Despliegue](./MANUAL_TECNICO_DESPLIEGUE.md)
*   [Guía de Reglas de Prioridad](./backend/COMO_AGREGAR_REGLAS.md)
*   [Cómo subir a GitHub](./INSTRUCCIONES_GITHUB.md)

---
Desarrollado para **CyaLab @ UPP**
