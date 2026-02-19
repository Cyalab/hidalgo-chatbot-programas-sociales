import React, { useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, input, setInput, onSend, loading, isCollapsed, toggleCollapse }) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            // Instant scroll for new messages to avoid jumpiness
            setTimeout(scrollToBottom, 100);
        }
    }, [messages, loading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };


    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-50">

            {/* Header */}
            <div className="h-20 flex items-center px-8 z-10 bg-white/60 backdrop-blur-md border-b border-white/40 shadow-sm">
                <div className="p-2 bg-[#691c32]/10 rounded-lg mr-4">
                    <Bot className="w-6 h-6 text-[#691c32]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[#691c32]">Asistente Hidalgo</h1>
                    <p className="text-xs text-gray-500 font-medium tracking-wide">SECRETARÍA DE GOBERNACIÓN</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={toggleCollapse}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#691c32]"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar z-0 relative scroll-smooth"
            >
                {messages.length === 0 ? (
                    // Empty State / Welcome Screen
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-80"
                    >
                        {/* ... existing welcome content ... */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#bc955c]/20 rounded-full blur-xl animate-pulse"></div>
                            {/* Replaced next/image with standard img tag, removed optimization props */}
                            <img
                                src="/hidalgo-logo.png"
                                alt="Hidalgo"
                                className="w-32 h-auto relative z-10 drop-shadow-lg opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                            <Bot size={80} className="text-[#691c32] relative z-10" />
                        </div>

                        <div className="max-w-md space-y-2">
                            <h2 className="text-3xl font-black text-[#691c32] tracking-tight">¡Hola! Soy tu Asistente.</h2>
                            <p className="text-gray-600 font-medium">
                                Estoy capacitado con los manuales operativos oficiales. Pregúntame sobre requisitos, fechas o procedimientos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                            {[
                                "📅 ¿Cuáles son las fechas de registro?",
                                "📄 ¿Qué requisitos necesito para la beca?",
                                "💰 ¿Cuánto es el monto del apoyo?",
                                "📍 ¿Dónde están las oficinas de atención?"
                            ].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="p-4 bg-white/60 hover:bg-white border border-white/50 rounded-xl shadow-sm hover:shadow-md transition-all text-left text-sm font-bold text-gray-700 hover:text-[#691c32] group"
                                >
                                    <span className="opacity-50 group-hover:opacity-100 mr-2 transition-opacity">💡</span>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    // Chat Messages
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user' ? 'bg-[#691c32] text-white' : 'bg-white text-[#bc955c] border border-gray-100'
                                        }`}>
                                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`p-5 shadow-sm backdrop-blur-sm text-lg leading-relaxed ${msg.role === 'user'
                                            ? 'bg-[#691c32]/90 text-white rounded-2xl rounded-tr-sm shadow-[#691c32]/20'
                                            : 'bg-white/90 text-black rounded-2xl rounded-tl-sm border border-white/50 shadow-gray-200/50'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex w-full justify-start pl-14"
                    >
                        <div className="bg-white/80 text-gray-800 rounded-2xl rounded-tl-sm p-4 flex gap-3 items-center border border-white/50 shadow-sm">
                            <Bot size={20} className="text-[#691c32] animate-bounce" />
                            <div className="flex gap-1.5 px-2">
                                <span className="w-2 h-2 bg-[#bc955c] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 bg-[#bc955c] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 bg-[#bc955c] rounded-full animate-bounce" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Analizando documentos...</span>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Input Floating Bar */}
            <div className="p-6 z-20">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#691c32] to-[#bc955c] rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl shadow-xl flex items-end p-2 border border-white/50 transition-all ring-1 ring-gray-100 focus-within:ring-[#bc955c]/50">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu pregunta..."
                            className="w-full bg-transparent text-black rounded-xl pl-4 py-4 focus:outline-none resize-none overflow-hidden min-h-[60px] max-h-[200px] text-lg font-medium placeholder:text-gray-500"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            onClick={onSend}
                            disabled={!input.trim() || loading}
                            className={`
                                mb-2 mr-2 p-3 rounded-xl transition-all shadow-md flex items-center justify-center
                                ${!input.trim() || loading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-[#691c32] to-[#8a2440] text-white hover:scale-105 hover:shadow-lg active:scale-95'}
                            `}
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-[0.2em] opacity-60">
                    IA generativa • verificar información oficial
                </p>
            </div>
        </div>
    );
};

export default ChatInterface;
