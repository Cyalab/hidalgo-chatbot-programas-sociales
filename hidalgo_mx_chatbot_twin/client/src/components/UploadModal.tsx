import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:8000';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setStatus('idle');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setStatus('idle');
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('success');
            setMessage('¡Documentos subidos correctamente! El chatbot los procesará en breve.');
            setFiles([]);
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setMessage('');
            }, 3000);
        } catch (error) {
            setStatus('error');
            setMessage('Error al subir archivos. Verifica que el servidor esté activo.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 relative"
            >
                <div className="bg-[#bc955c] p-4 flex justify-between items-center shadow-md z-10 relative">
                    <h3 className="text-white font-black text-lg tracking-widest uppercase flex items-center gap-2">
                        <Upload size={20} /> Cargar Documentos
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 bg-gradient-to-b from-white to-gray-50">
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${files.length > 0 ? 'border-[#bc955c] bg-[#bc955c]/5' : 'border-gray-300 hover:border-[#691c32] hover:bg-white'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            multiple
                            accept=".pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />

                        {files.length > 0 ? (
                            <div className="text-center w-full">
                                <div className="bg-[#bc955c] text-white p-3 rounded-full inline-flex mb-3 shadow-sm">
                                    <FileText size={32} />
                                </div>
                                <p className="font-bold text-gray-700 text-lg">{files.length} archivo(s)</p>
                                <div className="max-h-32 overflow-y-auto mt-2 custom-scrollbar">
                                    {files.map((f, i) => (
                                        <p key={i} className="text-xs text-gray-500 truncate w-full">{f.name}</p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="bg-gray-100 text-gray-400 p-4 rounded-full inline-flex mb-4 group-hover:bg-[#691c32]/10 group-hover:text-[#691c32] transition-colors shadow-inner">
                                    <Upload size={40} />
                                </div>
                                <p className="font-bold text-gray-600 text-lg">Arrastra tus PDFs aquí</p>
                                <p className="text-sm text-gray-400 mt-2">o haz clic para explorar</p>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm font-bold shadow-sm ${status === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
                            >
                                {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0 || uploading}
                        className="w-full mt-6 bg-[#691c32] hover:bg-[#4a1222] text-white font-black py-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:active:scale-100"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> PROCESANDO...
                            </>
                        ) : (
                            'SUBIR Y PROCESAR'
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4 italic font-medium">
                        * El sistema se re-entrenará automáticamente tras la carga.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default UploadModal;
