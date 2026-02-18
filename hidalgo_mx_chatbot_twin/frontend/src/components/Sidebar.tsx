'use client';

import React, { useState } from 'react';
import { MessageSquare, Settings, Upload, Plus, FileText, Cpu, Lock } from 'lucide-react';
import { uploadFiles, verifyAdvisorKey } from '@/lib/api';

interface SidebarProps {
    currentModel: string;
    setModel: (model: string) => void;
    onNewChat: () => void;
    setUserContext: (ctx: any) => void;
    isAdvisor: boolean;
    setAdvisor: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModel, setModel, onNewChat, setUserContext, isAdvisor, setAdvisor }) => {
    const [uploading, setUploading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authKey, setAuthKey] = useState('');
    const [visualAdvisorToggle, setVisualAdvisorToggle] = useState(false); // To show ON even if auth fails

    // Handlers for context changes
    const handleContextChange = (field: string, value: any) => {
        setUserContext((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUploading(true);
            try {
                await uploadFiles(Array.from(event.target.files));
                alert('Files uploaded successfully!');
            } catch (error) {
                alert('Failed to upload files.');
            } finally {
                setUploading(false);
            }
        }
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
        <div className="w-64 bg-[#1a1a1a] border-r border-[#333] flex flex-col h-screen text-gray-300 relative">
            {/* Auth Modal */}
            {showAuthModal && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#222] border border-[#444] rounded-lg p-4 w-full max-w-sm shadow-xl">
                        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <Lock size={14} /> Credenciales de Asesor
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">Ingrese su clave de acceso:</p>
                        <input
                            type="password"
                            className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 mb-3 focus:outline-none focus:border-blue-600 text-sm"
                            value={authKey}
                            onChange={(e) => setAuthKey(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmAuth()}
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-xs text-gray-400 hover:text-white px-2 py-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmAuth}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-b border-[#333]">
                <h1 className="text-xl font-bold text-white mb-4">HidalgoMX ChatBot</h1>
                <button
                    onClick={onNewChat}
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus size={18} />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Profile Context Section for Rules Engine Testing */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                        Contexto Ciudadano (Reglas)
                    </label>
                    <div className="space-y-2 text-sm text-gray-400">
                        <label className="text-[10px] uppercase text-gray-500 font-semibold">Región / Comunidad</label>
                        <select
                            className="w-full bg-[#111] border border-[#333] rounded px-2 py-2 focus:outline-none focus:border-blue-500"
                            onChange={(e) => handleContextChange('region', e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Huasteca">Huasteca</option>
                            <option value="Zempoala">Zempoala</option>
                            <option value="Otomí-Tepehua">Otomí-Tepehua</option>
                            <option value="Pachuca">Pachuca</option>
                            <option value="Tulancingo">Tulancingo</option>
                        </select>
                        <p className="text-[10px] text-gray-600 mt-1">
                            *La prioridad de apoyos depende exclusivamente de la comunidad.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                        Model Selection
                    </label>
                    <div className="space-y-2">
                        <button
                            onClick={() => setModel('phi-2')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${currentModel === 'phi-2' ? 'bg-[#333] text-white' : 'hover:bg-[#2a2a2a]'
                                }`}
                        >
                            <Cpu size={16} />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Microsoft Phi-2</span>
                                <span className="text-[10px] text-gray-500">Fast & Efficient</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setModel('socialite-llama')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${currentModel === 'socialite-llama' ? 'bg-[#333] text-white' : 'hover:bg-[#2a2a2a]'
                                }`}
                        >
                            <MessageSquare size={16} />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Socialite-Llama</span>
                                <span className="text-[10px] text-gray-500">Social Context Expert</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                        Modo Acceso
                    </label>
                    <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#333]">
                        <span className="text-sm text-gray-400">Soy Asesor Técnico</span>
                        <div
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isAdvisor ? 'bg-blue-600' : 'bg-gray-600'}`}
                            onClick={() => setAdvisor(!isAdvisor)}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAdvisor ? 'left-6' : 'left-1'}`} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                        Knowledge Base
                    </label>
                    <label className="cursor-pointer w-full border border-dashed border-[#555] rounded-md p-4 flex flex-col items-center justify-center text-sm hover:border-[#777] hover:bg-[#222] transition-colors">
                        <Upload size={24} className="mb-2 text-gray-400" />
                        <span className="text-gray-400">
                            {uploading ? 'Uploading...' : 'Upload PDFs'}
                        </span>
                        <input
                            type="file"
                            multiple
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            <div className="p-4 border-t border-[#333]">
                <button className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Settings size={16} />
                    Settings
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
