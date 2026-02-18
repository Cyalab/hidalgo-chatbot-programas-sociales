'use client';

import React, { useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    loading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, input, setInput, onSend, loading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-[#f9fafb] relative">
            {/* Header */}
            <div className="h-20 border-b-4 border-[#bc955c] flex items-center px-8 bg-[#691c32] shadow-lg">
                <div className="flex flex-col">
                    <span className="text-white font-black text-2xl tracking-tight">ASISTENTE VIRTUAL</span>
                    <span className="text-[#bc955c] text-sm font-bold uppercase tracking-widest">Gobierno del Estado de Hidalgo</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-6 flex gap-4 shadow-md ${msg.role === 'user'
                                    ? 'bg-[#691c32] text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none border-2 border-[#691c32]'
                                    }`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {msg.role === 'user' ? <User size={32} className="text-[#bc955c]" /> : <Bot size={32} className="text-[#691c32]" />}
                                </div>
                                <div className="text-2xl md:text-3xl font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex w-full justify-start"
                        >
                            <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none p-6 flex gap-4 items-center border-2 border-[#691c32] shadow-md">
                                <Bot size={32} className="text-[#691c32]" />
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 bg-[#bc955c] rounded-full animate-pulse" />
                                    <span className="w-3 h-3 bg-[#bc955c]/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                                    <span className="w-3 h-3 bg-[#bc955c]/30 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                                </div>
                                <span className="text-xl font-bold text-[#691c32] ml-2 animate-pulse uppercase tracking-widest">PROCESANDO...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="max-w-5xl mx-auto relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe aquí tu pregunta sobre programas sociales..."
                        className="w-full bg-white text-black border-4 border-[#691c32] rounded-2xl pl-6 pr-16 py-5 focus:outline-none focus:ring-4 focus:ring-[#bc955c]/30 resize-none overflow-hidden min-h-[100px] max-h-[350px] text-2xl md:text-3xl font-bold placeholder:text-gray-300 shadow-inner"
                        rows={1}
                        disabled={loading}
                        style={{ color: 'black', backgroundColor: 'white' }}
                    />
                    <button
                        onClick={onSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-6 bottom-6 p-4 bg-[#691c32] hover:bg-[#822340] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                    >
                        {loading ? <Loader2 size={32} className="animate-spin" /> : <Send size={32} />}
                    </button>
                </div>
                <p className="text-center text-sm text-[#bc955c] font-bold mt-4 uppercase tracking-widest">
                    Hidalgo sigue avanzado • Gobierno con Acento Social
                </p>
            </div>
        </div>
    );
};

export default ChatInterface;
