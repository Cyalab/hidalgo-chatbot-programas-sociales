import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { api } from './lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  gender: string;
  age_group: string;
  region: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('phi-2');
  const [isAdvisor, setIsAdvisor] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
    gender: '',
    age_group: '',
    region: ''
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await api.post('/chat', {
        message: userMsg,
        model_name: currentModel,
        user_context: userContext,
        is_advisor: isAdvisor
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Error al conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 8000.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden">
      <Sidebar
        currentModel={currentModel}
        setModel={setCurrentModel}
        onNewChat={handleNewChat}
        setUserContext={setUserContext}
        isAdvisor={isAdvisor}
        setAdvisor={setIsAdvisor}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out h-full ${isSidebarCollapsed ? 'ml-20' : 'ml-0 md:ml-80'
          }`}
      >
        <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          loading={loading}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
    </div>
  );
}

export default App;
