import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Settings as SettingsIcon, Code, Globe } from 'lucide-react';

import type { User } from '../types';

interface SettingsPageProps {
    user: User | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
    const SITE_ID = user?.site_id || 'TR-XXXX-Y';
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'manual' | 'wordpress'>('manual');

    const handleCopy = () => {
        navigator.clipboard.writeText(SITE_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyScript = () => {
        const script = `<script src="${window.location.origin}/tracker/ajans-tracker.js" data-site-id="${SITE_ID}" async></script>`;
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <header className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white">
                    <SettingsIcon className="w-8 h-8 text-purple-400" />
                    Entegrasyon Ayarları
                </h1>
                <p className="text-gray-400">Sitenizi sisteme bağlamak için gerekli kod ve araçlar.</p>
            </header>

            {/* Quick Site ID Bar */}
            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">Kimlik Numaranız (Site ID)</h3>
                    <p className="text-gray-400 text-sm">Bu kod sitenize özeldir ve tüm entegrasyonlarda kullanılır.</p>
                </div>
                <div className="flex gap-4 items-center w-full md:w-auto bg-black/40 p-2 rounded-xl border border-white/5">
                    <code className="bg-transparent px-4 font-mono text-xl font-bold tracking-widest text-green-400">
                        {SITE_ID}
                    </code>
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                </div>
            </div>

            {/* Integration Method Tabs */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-wrap justify-center md:justify-start gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'manual'
                            ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Code size={20} />
                        Manuel Kurulum (Önerilen)
                    </button>
                    <button
                        onClick={() => setActiveTab('wordpress')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'wordpress'
                            ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Globe size={20} />
                        WordPress Eklentisi
                    </button>
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel p-4 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden"
                >
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    {activeTab === 'manual' ? (
                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Standart Script Kurulumu</h3>
                                <p className="text-gray-400">Aşağıdaki tek satır kodu sitenizin <code className="text-pink-400">{'<head>'}</code> etiketleri arasına ekleyin. Hepsi bu kadar.</p>
                            </div>

                            <div className="bg-[#1e1e1e] p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner group relative overflow-x-auto">
                                <code className="text-sm font-mono text-blue-300 whitespace-pre-wrap break-all leading-relaxed">
                                    &lt;script src="{window.location.origin}/tracker/ajans-tracker.js" data-site-id="{SITE_ID}" async&gt;&lt;/script&gt;
                                </code>
                                <button
                                    onClick={handleCopyScript}
                                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                    title="Kodu Kopyala"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-white mb-1">🔒 Güvenli</h4>
                                    <p className="text-xs text-gray-400">Veriler şifreli olarak iletilir.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-white mb-1">⚡ Ultra Hızlı</h4>
                                    <p className="text-xs text-gray-400">Sadece 5KB boyutundadır ve sitenizi yavaşlatmaz.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-white mb-1">✅ Otomatik</h4>
                                    <p className="text-xs text-gray-400">Sayfa başlıklarını ve etkileşimleri otomatik algılar.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">WordPress Entegrasyonu</h3>
                                    <p className="text-gray-400">Kodla uğraşmak istemeyenler için hazır eklenti.</p>
                                </div>
                                <a
                                    href="/plugins/ajans-analitik.php"
                                    download="ajans-analitik.php"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                >
                                    <Download size={20} />
                                    Eklentiyi İndir
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                <div className="space-y-4">
                                    <h4 className="text-white font-medium mb-4">Adım Adım Kurulum</h4>
                                    <ul className="space-y-3">
                                        {[
                                            "Yukarıdaki butondan .php dosyasını indirin.",
                                            "WordPress admin panelinde Eklentiler > Yeni Ekle sayfasına gidin.",
                                            "Dosyayı yükleyip eklentiyi etkinleştirin.",
                                            "Ayarlar > Ajans Analitik menüsüne girin.",
                                            "Yukarıdaki Site ID kodunu yapıştırıp kaydedin."
                                        ].map((step, i) => (
                                            <li key={i} className="flex gap-3 text-gray-300 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm flex items-center justify-center font-bold border border-blue-500/20">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-black/30 rounded-2xl p-6 border border-white/10 flex items-center justify-center text-center">
                                    <div>
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Globe className="text-gray-500" size={32} />
                                        </div>
                                        <h5 className="font-bold text-gray-300 mb-2">Alternatif Yöntem</h5>
                                        <p className="text-sm text-gray-500">
                                            Eğer eklenti kullanmak istemiyorsanız, "Manuel Kurulum" sekmesindeki kodu <br />
                                            temanızın <code>footer.php</code> dosyasında <code>&lt;/body&gt;</code> öncesine ekleyebilirsiniz.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
