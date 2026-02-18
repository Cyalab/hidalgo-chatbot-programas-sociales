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
        <div className="flex-1 flex flex-col h-screen bg-[#0f0f0f] relative">
            {/* Header */}
            <div className="h-16 border-b border-[#333] flex items-center px-6 bg-[#1a1a1a]">
                <span className="text-gray-400 text-sm">Context: </span>
                <span className="ml-2 text-white font-medium">HidalgoMX Programas Sociales</span>
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
                                className={`max-w-[80%] rounded-2xl p-4 flex gap-3 ${msg.role === 'user'
                                    ? 'bg-[#2d2d2d] text-white rounded-tr-none'
                                    : 'bg-[#1e1e1e] text-gray-200 rounded-tl-none'
                                    }`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {msg.role === 'user' ? <User size={18} className="text-blue-400" /> : <Bot size={18} className="text-green-400" />}
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex w-full justify-start"
                        >
                            <div className="bg-[#1e1e1e] text-gray-200 rounded-2xl rounded-tl-none p-4 flex gap-3 items-center">
                                <Bot size={18} className="text-green-400" />
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#333] bg-[#0f0f0f]">
                <div className="max-w-4xl mx-auto relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message here..."
                        className="w-full bg-[#1e1e1e] text-white border border-[#333] rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-[#555] resize-none overflow-hidden min-h-[50px] max-h-[200px]"
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        onClick={onSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-3 bottom-3 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">
                    AI generated content can be inaccurate. Double check important information.
                </p>
            </div>
        </div>
    );
};

export default ChatInterface;
