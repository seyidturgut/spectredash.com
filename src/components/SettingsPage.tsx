import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Settings as SettingsIcon } from 'lucide-react';

import type { User } from '../types';

interface SettingsPageProps {
    user: User | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
    const SITE_ID = user?.site_id || 'TR-XXXX-Y';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SITE_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <header className="mb-10">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-purple-400" />
                    Ayarlar
                </h1>
                <p className="text-gray-400">Entegrasyon ve hesap ayarlarınızı yönetin.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden max-w-2xl"
            >
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Download className="w-5 h-5 text-green-400" />
                        WordPress Kurulumu
                    </h2>

                    <div className="space-y-6">
                        {/* ID Display Section */}
                        <div className="bg-black/40 p-6 rounded-xl border border-white/10">
                            <label className="text-gray-400 text-sm mb-2 block font-medium">Size Özel Site ID</label>
                            <div className="flex gap-4">
                                <code className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xl font-mono text-center tracking-wider text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                                    {SITE_ID}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[120px] justify-center"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Kopyalandı' : 'Kopyala'}
                                </button>
                            </div>
                        </div>

                        {/* Download & Instructions Section */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <a
                                    href="/plugins/ajans-analitik.php"
                                    download="ajans-analitik.php"
                                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-purple-500/20 group"
                                >
                                    <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                                        <Download className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-medium opacity-90">WordPress Eklentisi</div>
                                        <div className="text-lg">İndir (v1.2)</div>
                                    </div>
                                </a>

                                <div className="space-y-4 flex-1">
                                    <h3 className="text-white font-medium flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Kurulum Talimatları
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            "Soldaki butona tıklayarak eklenti dosyasını (.php) indirin.",
                                            "WordPress admin panelinize gidin: Eklentiler > Yeni Ekle.",
                                            "Dosyayı yükleyin ve etkinleştirin.",
                                            "Ayarlar > Ajans Analitik menüsüne gidin.",
                                            "Aşağıdaki 'Size Özel Site ID' kodunu kopyalayıp oraya yapıştırın."
                                        ].map((step, i) => (
                                            <li key={i} className="flex gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white text-sm flex items-center justify-center font-bold border border-white/10">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
