import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, User, Shield, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import type { User as UserType } from '../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
    const SITE_ID = user?.site_id || 'TR-XXXX-Y';
    const [copied, setCopied] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SITE_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal Panel - Command Center Style */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[70] p-0"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-400" />
                                Profil ve Ayarlar
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Section 1: Account Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <User size={14} /> Hesap Bilgileri
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-gray-500 ml-1">Ad Soyad / Şirket</label>
                                        <input
                                            type="text"
                                            value={user.contact_name || user.company_name || 'İsimsiz Kullanıcı'}
                                            readOnly
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-gray-500 ml-1">E-posta</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            {/* Section 2: Site Tracking Code */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Zap size={14} /> Site Takip Kodu
                                </h3>
                                <div className="bg-black/30 p-1 rounded-xl border border-white/10 flex items-center">
                                    <code className="flex-1 px-4 text-green-400 font-mono tracking-wide">{SITE_ID}</code>
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-2 border-l border-white/10"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        <span className="text-sm">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Bu kodu WordPress eklentinizin ayarlar sayfasına yapıştırın.
                                </p>
                            </div>

                            <div className="h-px bg-white/5" />

                            {/* Section 3: Appearance */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium mb-1">Animasyonları Azalt</h3>
                                    <p className="text-xs text-gray-500">Arayüzdeki hareketli efektleri minimuma indirir.</p>
                                </div>
                                <button
                                    onClick={() => setReduceMotion(!reduceMotion)}
                                    className={clsx(
                                        "w-12 h-6 rounded-full transition-colors relative",
                                        reduceMotion ? "bg-purple-600" : "bg-white/10"
                                    )}
                                >
                                    <motion.div
                                        animate={{ x: reduceMotion ? 26 : 2 }}
                                        className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-lg"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Footer decorative line */}
                        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-20" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
