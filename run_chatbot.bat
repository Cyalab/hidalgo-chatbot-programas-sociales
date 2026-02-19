@echo off
start cmd /k "cd hidalgo_mx_chatbot_twin\backend && pip install -r requirements.txt && python main.py"
start cmd /k "cd hidalgo_mx_chatbot_twin\client && npm install && npm run dev"
echo "Starting HidalgoMX Chatbot Twin..."
echo "Backend running on http://localhost:8000"
echo "Frontend running on http://localhost:5173"
pause
