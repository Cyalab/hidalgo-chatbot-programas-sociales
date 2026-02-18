'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import { sendMessage } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hola, soy tu asistente de Programas Sociales de Hidalgo. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModel, setModel] = useState('phi-2');
  const [userContext, setUserContext] = useState({});
  const [isAdvisor, setAdvisor] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(userMessage.content, currentModel, userContext, isAdvisor);
      const aiMessage: Message = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      let errorMsg = 'Lo siento, hubo un error al conectar con el servidor.';
      if (error.response?.status === 503) {
        errorMsg = 'El sistema se está preparando (procesando documentos). Por favor, intenta de nuevo en un par de minutos.';
      }
      const errorMessage: Message = { role: 'assistant', content: errorMsg };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      { role: 'assistant', content: 'Hola, soy tu asistente de Programas Sociales de Hidalgo. ¿En qué puedo ayudarte hoy?' }
    ]);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">
      <Sidebar
        currentModel={currentModel}
        setModel={setModel}
        onNewChat={handleNewChat}
        setUserContext={setUserContext}
        isAdvisor={isAdvisor}
        setAdvisor={setAdvisor}
      />
      <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          loading={loading}
        />
      </div>
    </div>
  );
}
