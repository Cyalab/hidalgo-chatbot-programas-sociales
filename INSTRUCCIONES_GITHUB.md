# Guía para Subir el Proyecto a GitHub

Sigue estos pasos para crear un repositorio en GitHub y subir tu código por primera vez.

## Prerrequisitos
1.  **Tener Git instalado**: Si no lo tienes, descárgalo e instálalo desde [git-scm.com](https://git-scm.com/downloads).
2.  **Cuenta en GitHub**: Debes tener una cuenta en [github.com](https://github.com/).

## Paso 1: Inicializar Git en tu proyecto local
Abre una terminal (CMD, PowerShell o Git Bash) en la carpeta raíz de tu proyecto (`ProgramasSociales120`) y ejecuta los siguientes comandos:

1.  Inicializa el repositorio:
    ```bash
    git init
    ```
2.  Prepara los archivos para el primer commit (esto usa el archivo `.gitignore` para excluir archivos innecesarios como claves y carpetas pesadas):
    ```bash
    git add .
    ```
3.  Guarda los cambios localmente:
    ```bash
    git commit -m "Commit inicial del proyecto Chatbot Gemelo Hidalgo"
    ```

## Paso 2: Crear un repositorio vacío en GitHub
1.  Inicia sesión en tu cuenta de GitHub.
2.  Ve a [github.com/new](https://github.com/new).
3.  **Repository name**: Escribe un nombre, por ejemplo `hidalgo-chatbot-twin`.
4.  **Description** (Opcional): "Asistente inteligente para programas sociales de Hidalgo".
5.  **Public/Private**: Elige según prefieras. Si tienes claves privadas o datos sensibles, mejor usa "Private".
6.  **Importante**: **NO** marques ninguna de las casillas de "Initialize this repository with:" (ni README, ni .gitignore, ni License). Queremos un repositorio vacío.
7.  Haz clic en **Create repository**.

## Paso 3: Conectar tu código local con GitHub
Una vez creado el repositorio, GitHub te mostrará unos comandos bajo el título "…or push an existing repository from the command line". Copia y ejecuta esos comandos en tu terminal, que serán parecidos a estos (sustituye `TU_USUARIO` y `TU_REPOSITORIO` por los tuyos):

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

¡Listo! Si refrescas la página de GitHub, verás tus archivos subidos.

## Notas sobre Seguridad
El archivo `.gitignore` ya está configurado para evitar subir:
*   Carpetas de dependencias (`node_modules`, `venv`)
*   Archivos de entorno y secretos (`.env`, `advisor_keys.json`)
*   Archivos pesados (`*.pdf`, `*.zip`)

**Nunca** fuerces la subida de estos archivos manuálmente.
