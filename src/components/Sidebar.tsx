import { LayoutDashboard, Activity, Settings, X, Users2, LogOut, Target, Zap, Map } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types';
import { LiveUserBadge } from './LiveUserBadge';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: any) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
    user: User | null;
    onLogout: () => void;
    liveUserCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isMobileOpen, onMobileClose, user, onLogout, liveUserCount = 0 }) => {

    // Default Items (Client View)
    let menuItems = [
        { icon: LayoutDashboard, label: 'Panel', id: 'dashboard' },
        { icon: Activity, label: 'Gerçek Zamanlı', id: 'realtime' },
        { icon: Target, label: 'Hedefler', id: 'goals' },
        { icon: Zap, label: 'Olaylar', id: 'events' },
        { icon: Map, label: 'Heatmap', id: 'heatmap' },
        { icon: Settings, label: 'Ayarlar', id: 'settings' },
    ];

    // Admin View (Replaces everything)
    if (user?.role === 'admin') {
        menuItems = [
            { icon: Users2, label: 'Müşteriler', id: 'admin_customers' },
            { icon: Settings, label: 'Ayarlar', id: 'settings' },
        ];
    }

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onMobileClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={clsx(
                "fixed left-0 top-0 h-screen w-64 glass-sidebar z-50 flex flex-col py-8 transition-transform duration-300 transform lg:translate-x-0 border-r border-white/5",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={onMobileClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white lg:hidden"
                >
                    <X size={24} />
                </button>

                {/* Logo */}
                <div className="px-6 mb-12 flex items-center space-x-3 w-full">
                    <img src="/img/favicon.png" alt="Spectre Logo" className="w-8 h-8" />
                    <span className="font-bold text-xl tracking-wider text-white">Spectre</span>
                </div>

                {/* Role Badge */}
                <div className="px-6 mb-6">
                    <div className={clsx(
                        "text-xs font-bold px-3 py-1 rounded-full w-fit uppercase tracking-wide",
                        user?.role === 'admin' ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    )}>
                        {user?.role === 'admin' ? 'Yönetici' : 'Müşteri'}
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 w-full px-4 space-y-2">
                    {menuItems.map((item: any) => (
                        <motion.button
                            key={item.label}
                            disabled={item.disabled}
                            onClick={() => {
                                if (item.disabled) return;
                                onNavigate(item.id);
                                onMobileClose();
                            }}
                            whileHover={item.disabled ? {} : { scale: 1.02, x: 5 }}
                            whileTap={item.disabled ? {} : { scale: 0.98 }}
                            className={clsx(
                                "w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                activeView === item.id
                                    ? "bg-white/10 text-white shadow-lg shadow-purple-500/10 border border-white/5"
                                    : "text-gray-400 hover:text-white hover:bg-white/5",
                                item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-400"
                            )}
                        >
                            {activeView === item.id && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-blue-500" />
                            )}
                            <item.icon className={clsx("w-6 h-6 mr-3 transition-colors", activeView === item.id ? "text-purple-400" : "group-hover:text-purple-300")} />
                            <span className="font-medium">{item.label}</span>

                            {/* Hover Glow Effect */}
                            {!item.disabled && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            )}
                        </motion.button>
                    ))}
                </nav>

                {/* Live Badge */}
                <div className="px-4 mt-4 flex justify-center">
                    <LiveUserBadge count={liveUserCount} />
                </div>

                {/* Logout Button (Bottom) */}
                <div className="px-4 pt-4 border-t border-white/5">
                    <motion.button
                        onClick={onLogout}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group"
                    >
                        <LogOut className="w-6 h-6 mr-3 transition-colors group-hover:text-red-300" />
                        <span className="font-medium">Çıkış Yap</span>
                    </motion.button>
                </div>
            </aside>
        </>
    );
};
