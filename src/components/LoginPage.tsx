import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import type { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
    onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Giriş başarısız');
            }

            // Success
            onLogin(data.user);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative"
            >
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden backdrop-blur-xl">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 z-10"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    {/* Header */}
                    <div className="text-center mb-10 mt-4">
                        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
                            <img src="/img/favicon.png" alt="Spectre Logo" className="w-full h-full object-contain drop-shadow-2xl" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">
                            Spectre Analytics
                        </h1>

                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 ml-1">E-posta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                placeholder="ornek@sirket.com"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-medium text-gray-400">Şifre</label>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={clsx(
                                "w-full mt-2 py-3.5 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center relative overflow-hidden group",
                                isLoading ? "bg-purple-600/50 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    <span className="relative z-10 flex items-center gap-2">
                                        Giriş Yap <ArrowRight size={18} />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                </>
                            )}
                        </button>
                    </form>


                </div>
            </motion.div>
        </div>
    );
};
