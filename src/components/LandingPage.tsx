import { useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, Check, Zap, Shield, ChevronRight, Lock, Loader2, MousePointer2, Sparkles, X } from 'lucide-react';

interface LandingPageProps {
    onLoginClick: () => void;
}

interface ContactFormData {
    fullName: string;
    companyName: string;
    email: string;
    phone: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
    const dashboardY = useTransform(scrollY, [0, 400], [100, -50]);

    // Mouse Tilt Effect for Dashboard
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - left) / width - 0.5);
        mouseY.set((e.clientY - top) / height - 0.5);
    };

    const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
    const [email, setEmail] = useState('');

    // Contact Form Modal State
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactFormData, setContactFormData] = useState<ContactFormData>({
        fullName: '',
        companyName: '',
        email: '',
        phone: ''
    });

    const handlePreRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('loading');

        try {
            const response = await fetch('/api/submit_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setFormState('success');
                setTimeout(() => {
                    setFormState('idle');
                    setEmail('');
                }, 3000);
            } else {
                throw new Error(data.message || 'Kayıt başarısız oldu');
            }
        } catch (error) {
            console.error('Email registration error:', error);
            // Show error but still reset form
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
            setFormState('idle');
        }
    };

    // Contact Form Handlers
    const handleContactFormChange = (field: keyof ContactFormData, value: string) => {
        setContactFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Format WhatsApp message
        const message = `🚀 *Yeni Müşteri Talebi - Spectre Analytics*

👤 *Ad Soyad:* ${contactFormData.fullName}
🏢 *Firma Adı:* ${contactFormData.companyName}
📧 *E-posta:* ${contactFormData.email}
📱 *Telefon:* ${contactFormData.phone}

---
_Bu mesaj Spectre Analytics web sitesinden otomatik olarak gönderilmiştir._`;

        // WhatsApp URL with pre-filled message
        const whatsappUrl = `https://wa.me/905336746421?text=${encodeURIComponent(message)}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');

        // Close modal and reset form
        setShowContactModal(false);
        setContactFormData({
            fullName: '',
            companyName: '',
            email: '',
            phone: ''
        });
    };

    // Video logic removed for simple loop

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden selection:bg-purple-500/30">

            {/* LIQUID DATA ANIMATION BACKGROUND */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-[#050505]" />

                {/* Liquid Container */}
                <div className="absolute inset-0 w-full h-full" style={{ filter: 'url(#goo)' }}>
                    {/* Main "Data Pool" in center */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-indigo-600/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
                    />

                    {/* Flowing Streams - Data Incoming */}
                    <motion.div
                        animate={{
                            x: ["-50%", "0%", "50%"],
                            y: ["-20%", "0%", "20%"],
                            scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/40 rounded-full blur-3xl mix-blend-screen"
                    />
                    <motion.div
                        animate={{
                            x: ["50%", "0%", "-50%"],
                            y: ["20%", "0%", "-20%"],
                        }}
                        transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/40 rounded-full blur-3xl mix-blend-screen"
                    />
                </div>

                {/* Grid Overlay for "Data/Tech" feel */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

                {/* SVG Filter Definition */}
                <svg className="hidden">
                    <defs>
                        <filter id="goo">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                            <feBlend in="SourceGraphic" in2="goo" />
                        </filter>
                    </defs>
                </svg>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 relative">
                        <div className="absolute inset-0 bg-purple-500 blur-lg opacity-50 animate-pulse-slow" />
                        <img src="/img/favicon.png" alt="Logo" className="relative w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-xl tracking-wider hidden md:block font-space">SPECTRE</span>
                </div>
                <button
                    onClick={onLoginClick}
                    className="group relative px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all overflow-hidden"
                >
                    <span className="relative z-10 font-medium flex items-center gap-2 text-sm">
                        Giriş Yap <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            </nav>

            {/* HERO SECTION */}
            <motion.header
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-12 px-4 text-center perspective-1000"
            >
                <div className="relative z-10 max-w-5xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs md:text-sm font-mono text-purple-300 backdrop-blur-md shadow-2xl"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        GELECEĞİN ANALİTİK ODASI
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] drop-shadow-2xl font-space"
                    >
                        Akıllı Analitik. <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-blue-400 animate-gradient-x">
                            Veriyi Hisset.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mt-6 drop-shadow-lg"
                    >
                        Sadece sayıları gösteren sıkıcı paneller bitti.<br />
                        Spectre ile web sitenizin nabzını, yapay zeka ve sinematik görselleştirme ile takip edin.
                    </motion.p>
                </div>

                {/* 3D Dashboard Preview */}
                <motion.div
                    style={{ y: dashboardY, rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    className="mt-20 w-full max-w-6xl mx-auto relative group perspective-1000"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none h-full w-full" />

                    {/* Glass Container */}
                    <div className="p-2 md:p-4 rounded-3xl bg-gradient-to-b from-white/10 to-white/0 backdrop-blur-md border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.15)] transform-gpu transition-transform duration-100">
                        {/* Real Dashboard Image */}
                        <img
                            src="/img/dashboard-hero.png"
                            alt="Spectre Dashboard Preview"
                            className="rounded-2xl w-full h-auto shadow-2xl"
                        />

                        {/* Optional Glow/Reflection Overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                    </div>
                </motion.div>
            </motion.header>

            {/* INFINITE MARQUEE */}
            <div className="py-10 border-y border-white/5 bg-black/40 backdrop-blur-md overflow-hidden flex relative z-20">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap gap-12 text-gray-400 font-bold text-xl md:text-2xl tracking-widest uppercase select-none font-space"
                >
                    {[...Array(2)].fill([
                        "Realtime Tracking", "AI Insights", "Heatmap V2", "Privacy First", "Next-Gen UI", "Zero Latency", "Global CDN"
                    ]).flat().map((text, i) => (
                        <span key={i} className="flex items-center gap-4">
                            {text} <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* BENTO GRID FEATURES */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto mb-20 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 font-space">Gelişmiş Web Analitik Özellikleri</h2>
                    <p className="text-gray-400">Klasik analitik araçlarının yapamadığı her şey burada. Yapay zeka, gerçek zamanlı heatmap ve daha fazlası.</p>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-6 h-auto md:h-[600px]">

                    {/* Feature 1: AI (Large Left) */}
                    <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-8 flex flex-col justify-between">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-3xl font-bold mb-3 font-space">Yapay Zeka Destekli Analiz ve Öngörüler</h3>
                            <p className="text-gray-400 text-lg">
                                "Geçen haftaya göre %20 düşüş var" diyen sıkıcı raporlar yok.
                                AI size neden düştüğünü ve ne yapmanız gerektiğini insan gibi anlatır. Akıllı öneriler ve tahminlerle sitenizi optimize edin.
                            </p>
                        </div>
                        {/* Fake Chat UI */}
                        <div className="mt-8 space-y-3">
                            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none w-3/4 mr-auto text-sm text-gray-300">
                                Bugün mobil trafik neden bu kadar yüksek?
                            </div>
                            <div className="bg-purple-600/20 border border-purple-500/30 p-3 rounded-2xl rounded-tr-none w-3/4 ml-auto text-sm text-purple-200">
                                Instagram'da paylaştığın son hikaye viral oldu. Ziyaretçilerin %80'i oradan geliyor.
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Heatmap (Top Right) */}
                    <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-8">
                        <div className="absolute top-0 right-0 p-32 bg-orange-500/10 blur-[100px] rounded-full" />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                                    <MousePointer2 size={20} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 font-space">Gerçek Zamanlı Heatmap ve Kullanıcı Takibi</h3>
                                <p className="text-gray-400 text-sm">Ziyaretçilerin nereye tıkladığını, nereye baktığını, nasıl scroll yaptığını film izler gibi izle. Click tracking ve scroll heatmap.</p>
                            </div>
                            {/* Abstract Graphic */}
                            <div className="flex gap-1">
                                <div className="w-2 h-16 bg-red-500/50 rounded-full animate-pulse" />
                                <div className="w-2 h-10 bg-yellow-500/50 rounded-full animate-pulse delay-75" />
                                <div className="w-2 h-24 bg-green-500/50 rounded-full animate-pulse delay-150" />
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Realtime (Bottom Mid) */}
                    <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-8">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 font-space">Gerçek Zamanlı Veri İşleme</h3>
                        <div className="text-4xl font-mono font-bold text-white mt-4">12ms</div>
                        <p className="text-xs text-gray-500 mt-1">Veri işleme hızı</p>
                    </div>

                    {/* Feature 4: Privacy (Bottom Right) */}
                    <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 font-space">GDPR ve KVKK Uyumlu Analitik</h3>
                        <p className="text-sm text-gray-400">Çerez yok. Pop-up yok. %100 gizlilik odaklı.<br />KVKK & GDPR uyumlu web analitik.</p>
                    </div>
                </div>
            </section>

            {/* STATS SHOWCASE SECTION */}
            <section className="py-20 bg-gradient-to-b from-transparent to-white/5 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Analiz Edilen Veri", val: "10M+", color: "text-purple-400" },
                        { label: "Aktif Siteler", val: "500+", color: "text-blue-400" },
                        { label: "Uptime", val: "%99.9", color: "text-green-400" },
                        { label: "Memnuniyet", val: "5.0", color: "text-yellow-400" },
                    ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <div className={`text-4xl md:text-5xl font-bold ${stat.color} font-space`}>{stat.val}</div>
                            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PRICING */}
            <section className="py-32 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2.5rem] opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-14 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Lock size={150} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="inline-block bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full mb-4">HER ŞEY DAHİL</div>
                                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-space">Spectre Analytics Pro - Sınırsız Analitik</h2>
                                    <p className="text-gray-400 mb-8 text-lg">
                                        Limitleme yok. Gizli ücret yok.<br />Tüm özelliklere sınırsız erişim.
                                    </p>
                                    <ul className="space-y-4 mb-8">
                                        {['Sınırsız Ziyaretçi Takibi', 'Sınırsız Site Ekleme', '1 Yıl Veri Saklama', 'AI Destekli Öngörüler (Sınırsız)', '7/24 Öncelikli Whatsapp Desteği'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                                                    <Check size={14} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="text-center md:text-right bg-white/5 p-8 rounded-2xl border border-white/5">
                                    <div className="text-sm text-gray-500 mb-2 font-mono uppercase tracking-widest">Aylık Üyelik</div>
                                    <div className="flex items-center justify-center md:justify-end gap-1 mb-2">
                                        <span className="text-2xl text-gray-400">$</span>
                                        <span className="text-7xl font-bold text-white tracking-tighter font-space">199</span>
                                        <span className="text-2xl text-gray-400">.99</span>
                                    </div>
                                    <div className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-4">Kredi kartı gerekmez.<br />İstediğin zaman iptal et.</div>

                                    <button
                                        onClick={() => setShowContactModal(true)}
                                        className="w-full px-8 py-5 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group/btn text-lg"
                                    >
                                        Hemen Başla
                                        <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* PRE-REGISTRATION */}
            <section className="py-32 px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-xl mx-auto"
                >
                    <h2 className="text-4xl font-bold mb-6 font-space">Web Analitik Platformuna Erken Erişim</h2>
                    <p className="text-gray-400 mb-10 text-lg">
                        Bu deneyimin bir parçası olmak için bekleme listesine katılın.<br />
                        Sınırlı sayıda kontenjan açılacaktır.
                    </p>

                    <form onSubmit={handlePreRegister} className="relative max-w-md mx-auto">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-posta adresiniz"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-36 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-600 text-lg"
                        />
                        <button
                            type="submit"
                            disabled={formState !== 'idle'}
                            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 rounded-xl font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                        >
                            {formState === 'loading' ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : formState === 'success' ? (
                                <Check size={24} />
                            ) : (
                                "Kayıt Ol"
                            )}
                        </button>
                    </form>

                    {formState === 'success' && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-green-400 mt-6 text-lg font-medium"
                        >
                            Tebrikler! Listeye eklendiniz. 🚀
                        </motion.p>
                    )}
                </motion.div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 text-center text-gray-600 text-sm relative z-10 border-t border-white/5">
                <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
                    <img src="/img/favicon.png" alt="Logo" className="w-6 h-6 grayscale" />
                    <span className="font-bold tracking-widest">SPECTRE ANALYTICS</span>
                </div>
                <p className="mb-6">© 2026 Spectre Inc. All rights reserved.</p>
                <div className="flex justify-center gap-8">
                    <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
                    <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                </div>
            </footer>

            {/* CONTACT FORM MODAL */}
            {showContactModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowContactModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group"
                        >
                            <X size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                        </button>

                        {/* Header */}
                        <div className="mb-8">
                            <div className="inline-block bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
                                HEMEN BAŞLA
                            </div>
                            <h3 className="text-3xl font-bold mb-2 font-space text-white">İletişim Bilgileriniz</h3>
                            <p className="text-gray-400">
                                Bilgilerinizi doldurun, size WhatsApp üzerinden ulaşalım.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleContactFormSubmit} className="space-y-5">
                            {/* Ad Soyad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Ad Soyad <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactFormData.fullName}
                                    onChange={(e) => handleContactFormChange('fullName', e.target.value)}
                                    placeholder="Ahmet Yılmaz"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-600"
                                />
                            </div>

                            {/* Firma Adı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Firma Adı <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactFormData.companyName}
                                    onChange={(e) => handleContactFormChange('companyName', e.target.value)}
                                    placeholder="Şirketinizin adı"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-600"
                                />
                            </div>

                            {/* E-posta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    E-posta <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={contactFormData.email}
                                    onChange={(e) => handleContactFormChange('email', e.target.value)}
                                    placeholder="ornek@sirket.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-600"
                                />
                            </div>

                            {/* Telefon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Telefon <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={contactFormData.phone}
                                    onChange={(e) => handleContactFormChange('phone', e.target.value)}
                                    placeholder="0532 123 45 67"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-600"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group mt-6"
                            >
                                WhatsApp'tan Gönder
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Bilgileriniz güvenli bir şekilde WhatsApp üzerinden iletilecektir.
                            </p>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
