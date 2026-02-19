import React, { useState } from 'react';
import { Settings, Plus, Upload, Lock, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { verifyAdvisorKey } from '../lib/api';
import UploadModal from './UploadModal';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    currentModel: string;
    setModel: (model: string) => void;
    onNewChat: () => void;
    setUserContext: (ctx: any) => void;
    isAdvisor: boolean;
    setAdvisor: (val: boolean) => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    currentModel,
    setModel,
    onNewChat,
    setUserContext,
    isAdvisor,
    setAdvisor,
    isCollapsed,
    toggleCollapse
}) => {
    // const [isCollapsed, setIsCollapsed] = useState(false); // Controlled by parent now
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [authKey, setAuthKey] = useState('');
    const [visualAdvisorToggle, setVisualAdvisorToggle] = useState(false);

    const handleContextChange = (field: string, value: any) => {
        setUserContext((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleAdvisorToggle = () => {
        if (visualAdvisorToggle) {
            setVisualAdvisorToggle(false);
            setAdvisor(false);
            setModel('phi-2');
        } else {
            setShowAuthModal(true);
        }
    };

    const confirmAuth = async () => {
        setShowAuthModal(false);
        setVisualAdvisorToggle(true);
        const isValid = await verifyAdvisorKey(authKey);
        if (isValid) {
            setAdvisor(true);
            setModel('socialite-llama');
        } else {
            setAdvisor(false);
            setModel('phi-2');
        }
        setAuthKey('');
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <div className={`md:hidden fixed top-4 left-4 z-50 transition-opacity ${isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/40 text-[#691c32]"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-40 bg-white/80 backdrop-blur-2xl border-r border-white/50 shadow-2xl transition-all duration-300 flex flex-col
                ${isCollapsed ? 'w-20' : 'w-80'}
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>

                {/* Close Button Mobile */}
                <div className="md:hidden absolute top-4 right-4">
                    <button onClick={() => setIsMobileOpen(false)} className="text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Header / Logo */}
                <div className="p-6 flex items-center justify-between">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col"
                        >
                            <h1 className="text-2xl font-black text-[#691c32] tracking-tighter leading-none">
                                HIDALGO<span className="text-[#bc955c]">MX</span>
                            </h1>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Gobierno Digital</span>
                        </motion.div>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:flex p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-4 mb-6">
                    <button
                        onClick={onNewChat}
                        className={`
                            w-full bg-gradient-to-r from-[#691c32] to-[#8a2440] hover:from-[#8a2440] hover:to-[#a02b4d] text-white 
                            shadow-lg shadow-[#691c32]/30 transition-all active:scale-95 flex items-center justify-center gap-2
                            ${isCollapsed ? 'p-3 rounded-full aspect-square' : 'py-3 px-4 rounded-xl'}
                        `}
                    >
                        <Plus size={24} />
                        {!isCollapsed && <span className="font-bold tracking-wide">NUEVO CHAT</span>}
                    </button>
                </div>

                {/* Main Menu */}
                <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">

                    {/* Upload Section */}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className={`
                            w-full flex items-center gap-3 text-gray-600 hover:text-[#691c32] hover:bg-[#691c32]/5 rounded-xl transition-all
                            ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                        `}
                        title="Cargar Documentos"
                    >
                        <Upload size={isCollapsed ? 24 : 20} className="text-[#bc955c]" />
                        {!isCollapsed && <span className="font-bold text-sm">Cargar Documentos</span>}
                    </button>

                    {!isCollapsed && (
                        <>
                            <div className="border-t border-gray-200 my-4 mx-2" />

                            {/* Filters Section */}
                            <div className="space-y-4">
                                <label className="px-2 text-xs font-black text-[#bc955c] uppercase tracking-[0.1em]">
                                    Perfil del Ciudadano
                                </label>

                                <div className="space-y-3 px-2">
                                    {/* Gender */}
                                    <div className="bg-white/50 rounded-lg p-2 border border-gray-100">
                                        <select
                                            className="w-full bg-transparent text-sm font-bold text-gray-700 focus:outline-none"
                                            onChange={(e) => handleContextChange('gender', e.target.value)}
                                        >
                                            <option value="">Género...</option>
                                            <option value="Mujer">Mujer</option>
                                            <option value="Hombre">Hombre</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>

                                    {/* Age */}
                                    <div className="bg-white/50 rounded-lg p-2 border border-gray-100">
                                        <select
                                            className="w-full bg-transparent text-sm font-bold text-gray-700 focus:outline-none"
                                            onChange={(e) => handleContextChange('age_group', e.target.value)}
                                        >
                                            <option value="">Edad...</option>
                                            <option value="Niñez">Niñez (0-12)</option>
                                            <option value="Joven">Juventud (13-29)</option>
                                            <option value="Adulto">Adulto (30-59)</option>
                                            <option value="Adulto Mayor">Adulto Mayor (60+)</option>
                                        </select>
                                    </div>

                                    {/* Region */}
                                    <div className="bg-white/50 rounded-lg p-2 border border-gray-100">
                                        <select
                                            className="w-full bg-transparent text-sm font-bold text-gray-700 focus:outline-none"
                                            onChange={(e) => handleContextChange('region', e.target.value)}
                                        >
                                            <option value="">Región...</option>
                                            <option value="Huasteca">Huasteca</option>
                                            <option value="Zempoala">Zempoala</option>
                                            <option value="Otomí-Tepehua">Otomí-Tepehua</option>
                                            <option value="Pachuca">Pachuca</option>
                                            <option value="Tulancingo">Tulancingo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 my-4 mx-2" />

                            {/* Advisor Mode */}
                            <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-white shadow-sm mx-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black text-[#691c32] uppercase">Modo Asesor</span>
                                    <div
                                        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${visualAdvisorToggle ? 'bg-[#691c32]' : 'bg-gray-300'}`}
                                        onClick={handleAdvisorToggle}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${visualAdvisorToggle ? 'left-5' : 'left-1'}`} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-tight">Acceso a manuales operativos restringidos</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer / Settings */}
                <div className="p-4 border-t border-white/50 bg-white/30 backdrop-blur-sm">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`
                            w-full flex items-center gap-3 text-gray-600 hover:text-[#691c32] rounded-xl transition-all
                            ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}
                        `}
                        title="Configuración"
                    >
                        <Settings size={20} className={showSettings ? "text-[#bc955c] animate-spin-slow" : ""} />
                        {!isCollapsed && <span className="font-bold text-sm">Configuración</span>}
                    </button>

                    {/* Settings Panel (Inline if not collapsed, or Modal?) - keeping simple inline logic or modal */}
                    {showSettings && !isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 space-y-2 overflow-hidden"
                        >
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Modelo IA</label>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => setModel('phi-2')} className={`text-xs px-2 py-1 rounded text-left ${currentModel === 'phi-2' ? 'bg-[#bc955c]/20 text-[#bc955c] font-bold' : 'text-gray-500'}`}>
                                    Microsoft Phi-2 (Rápido)
                                </button>
                                <button onClick={() => setModel('socialite-llama')} className={`text-xs px-2 py-1 rounded text-left ${currentModel === 'socialite-llama' ? 'bg-[#bc955c]/20 text-[#bc955c] font-bold' : 'text-gray-500'}`}>
                                    Socialite-Llama (Experto)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20"
                        >
                            <div className="bg-[#691c32] p-4 flex justify-between items-center">
                                <h3 className="text-white font-black text-lg tracking-widest uppercase flex items-center gap-2">
                                    <Lock size={18} /> Acceso Asesor
                                </h3>
                                <button onClick={() => setShowAuthModal(false)} className="text-white/80 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 mb-4 font-medium">Ingresa tu clave de autorización:</p>
                                <input
                                    type="password"
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-[#bc955c] text-lg font-bold text-center tracking-widest"
                                    value={authKey}
                                    onChange={(e) => setAuthKey(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && confirmAuth()}
                                    autoFocus
                                    placeholder="••••••"
                                />
                                <button
                                    onClick={confirmAuth}
                                    className="w-full bg-[#bc955c] hover:bg-[#d6b47d] text-white font-black py-3 rounded-lg shadow-md transition-transform active:scale-95"
                                >
                                    VERIFICAR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
