'use client';

import React, { useState } from 'react';
import { MessageSquare, Settings, Plus, FileText, Cpu, Lock } from 'lucide-react';
import { verifyAdvisorKey } from '@/lib/api';

interface SidebarProps {
    currentModel: string;
    setModel: (model: string) => void;
    onNewChat: () => void;
    setUserContext: (ctx: any) => void;
    isAdvisor: boolean;
    setAdvisor: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModel, setModel, onNewChat, setUserContext, isAdvisor, setAdvisor }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [authKey, setAuthKey] = useState('');
    const [visualAdvisorToggle, setVisualAdvisorToggle] = useState(false); // To show ON even if auth fails

    // Handlers for context changes
    const handleContextChange = (field: string, value: any) => {
        setUserContext((prev: any) => ({ ...prev, [field]: value }));
    };



    // Auth Handler
    const handleAdvisorToggle = () => {
        if (visualAdvisorToggle) {
            // Turning OFF is always allowed
            setVisualAdvisorToggle(false);
            setAdvisor(false);
            setModel('phi-2'); // Revert to baseline
        } else {
            // Turning ON requires key
            setShowAuthModal(true);
        }
    };

    const confirmAuth = async () => {
        setShowAuthModal(false);
        setVisualAdvisorToggle(true); // Always turn ON visually (Silent Behavior)

        const isValid = await verifyAdvisorKey(authKey);

        if (isValid) {
            setAdvisor(true); // Grant real privileges
            setModel('socialite-llama'); // Upgrade model
        } else {
            setAdvisor(false); // No privileges
            setModel('phi-2'); // Stay on baseline
            // No error message displayed to user
        }
        setAuthKey('');
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen text-gray-800 relative transition-all shadow-xl">
            {/* Auth Modal */}
            {showAuthModal && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white border-2 border-[#bc955c] rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-black text-[#691c32] mb-2 flex items-center gap-2">
                            <Lock size={20} /> ACCESO ASESOR
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-tighter">Ingrese su clave de acceso:</p>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-3 mb-4 focus:outline-none focus:border-[#691c32] text-lg font-bold"
                            value={authKey}
                            onChange={(e) => setAuthKey(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmAuth()}
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-sm font-bold text-gray-400 hover:text-gray-600 px-4 py-2"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={confirmAuth}
                                className="text-sm bg-[#691c32] hover:bg-[#822340] text-white px-6 py-2 rounded-lg font-black shadow-md transition-all active:scale-95"
                            >
                                CONFIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white border-2 border-[#bc955c] rounded-xl p-8 w-full max-w-md shadow-2xl space-y-8">
                        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                            <h3 className="text-2xl font-black text-[#691c32] flex items-center gap-2">
                                <Settings size={28} /> CONFIGURACIÓN
                            </h3>
                            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-[#691c32] transition-colors">
                                <Plus size={32} className="rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-black text-[#bc955c] uppercase tracking-[0.2em] block">
                                MODELO DE INTELIGENCIA ARTIFICIAL
                            </label>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setModel('phi-2')}
                                    className={`w-full text-left px-5 py-5 rounded-xl flex items-center gap-4 transition-all shadow-sm ${currentModel === 'phi-2' ? 'bg-[#691c32] text-white ring-4 ring-[#691c32]/20' : 'bg-gray-50 border-2 border-gray-100 hover:border-[#691c32]/30 text-gray-700'
                                        }`}
                                >
                                    <Cpu size={28} className={currentModel === 'phi-2' ? 'text-[#bc955c]' : 'text-gray-400'} />
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold">Microsoft Phi-2</span>
                                        <span className={`text-sm ${currentModel === 'phi-2' ? 'text-white/70' : 'text-gray-400'}`}>Rápido y eficiente para consultas generales</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setModel('socialite-llama')}
                                    className={`w-full text-left px-5 py-5 rounded-xl flex items-center gap-4 transition-all shadow-sm ${currentModel === 'socialite-llama' ? 'bg-[#691c32] text-white ring-4 ring-[#691c32]/20' : 'bg-gray-50 border-2 border-gray-100 hover:border-[#691c32]/30 text-gray-700'
                                        }`}
                                >
                                    <MessageSquare size={28} className={currentModel === 'socialite-llama' ? 'text-[#bc955c]' : 'text-gray-400'} />
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold">Socialite-Llama</span>
                                        <span className={`text-sm ${currentModel === 'socialite-llama' ? 'text-white/70' : 'text-gray-400'}`}>Experto en programas y contexto social</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full bg-[#691c32] hover:bg-[#822340] text-white py-4 rounded-xl transition-all font-black uppercase tracking-widest text-lg shadow-lg active:scale-95"
                        >
                            APLICAR CAMBIOS
                        </button>
                    </div>
                </div>
            )}
            <div className="p-6 bg-[#691c32] text-white">
                <h1 className="text-3xl font-black mb-4 tracking-tighter">HIDALGO<span className="text-[#bc955c]">MX</span></h1>
                <button
                    onClick={onNewChat}
                    className="w-full bg-white text-[#691c32] hover:bg-gray-100 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-base font-bold shadow-md"
                >
                    <Plus size={20} />
                    NUEVO CHAT
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Profile Context Section for Rules Engine Testing */}
                <div>
                    <label className="text-sm font-black text-[#691c32] uppercase tracking-[0.2em] mb-4 block border-b-2 border-[#bc955c] pb-1">
                        FILTROS DE PERFIL
                    </label>
                    <div className="space-y-4 text-base text-gray-700">
                        {/* Sexo */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase text-gray-400 font-black">Sexo</label>
                            <select
                                className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:border-[#691c32] text-base font-bold transition-all text-gray-900 shadow-sm"
                                onChange={(e) => handleContextChange('gender', e.target.value)}
                            >
                                <option className="bg-white text-gray-900" value="">Seleccionar...</option>
                                <option className="bg-white text-gray-900" value="Mujer">Mujer</option>
                                <option className="bg-white text-gray-900" value="Hombre">Hombre</option>
                                <option className="bg-white text-gray-900" value="Otro">Otro / No especifica</option>
                            </select>
                        </div>

                        {/* Rango de Edad */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase text-gray-400 font-black">Rango de Edad</label>
                            <select
                                className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:border-[#691c32] text-base font-bold transition-all text-gray-900 shadow-sm"
                                onChange={(e) => handleContextChange('age_group', e.target.value)}
                            >
                                <option className="bg-white text-gray-900" value="">Seleccionar...</option>
                                <option className="bg-white text-gray-900" value="Niñez">Niñez (0-12)</option>
                                <option className="bg-white text-gray-900" value="Joven">Juventud (13-29)</option>
                                <option className="bg-white text-gray-900" value="Adulto">Adulto (30-59)</option>
                                <option className="bg-white text-gray-900" value="Adulto Mayor">Adulto Mayor (60+)</option>
                            </select>
                        </div>

                        {/* Región */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase text-gray-400 font-bold">Ubicación / Región</label>
                            <select
                                className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:border-[#691c32] text-base font-bold text-gray-900 shadow-sm"
                                onChange={(e) => handleContextChange('region', e.target.value)}
                            >
                                <option className="bg-white text-gray-900" value="">Seleccionar...</option>
                                <option className="bg-white text-gray-900" value="Huasteca">Huasteca</option>
                                <option className="bg-white text-gray-900" value="Zempoala">Zempoala</option>
                                <option className="bg-white text-gray-900" value="Otomí-Tepehua">Otomí-Tepehua</option>
                                <option className="bg-white text-gray-900" value="Pachuca">Pachuca</option>
                                <option className="bg-white text-gray-900" value="Tulancingo">Tulancingo</option>
                            </select>
                        </div>

                        <p className="text-xs text-gray-500 mt-1 leading-relaxed italic font-bold">
                            *La información ayuda a recomendar programas específicos para tu perfil.
                        </p>
                    </div>
                </div>



                {/* Access Mode Section - MOVED UP AND HIGHLIGHTED */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-100 shadow-inner">
                    <label className="text-sm font-black text-[#bc955c] uppercase tracking-[0.2em] mb-3 block">
                        MODO DE ACCESO
                    </label>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-gray-100 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-[#691c32]">Asesor Técnico</span>
                            <span className="text-xs text-gray-400 font-medium">Privilegios de funcionario</span>
                        </div>
                        <div
                            className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${visualAdvisorToggle ? 'bg-[#691c32]' : 'bg-gray-300'}`}
                            onClick={handleAdvisorToggle}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${visualAdvisorToggle ? 'left-8' : 'left-1'}`} />
                        </div>
                    </div>
                </div>


            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm font-black text-[#691c32] hover:text-[#bc955c] transition-colors uppercase tracking-widest"
                >
                    <Settings size={18} />
                    Configuración
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
