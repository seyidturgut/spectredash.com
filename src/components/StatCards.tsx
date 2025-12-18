import { motion } from 'framer-motion';
import { Users, Clock, Radio } from 'lucide-react';
import { clsx } from 'clsx';
import type { Stats } from '../types';

interface StatCardsProps {
    stats: Stats;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {

    const cards = [
        {
            title: 'Toplam Ziyaret',
            value: stats.totalVisits.toLocaleString(),
            change: `+${stats.totalVisitsChange}%`,
            changeLabel: 'geçen aya göre',
            icon: Users,
            color: 'from-cyan-500 to-blue-500',
            iconColor: 'text-cyan-400',
            highlight: true,
        },
        {
            title: 'Ort. Görüntüleme Süresi',
            value: stats.averageDuration,
            change: '+5.2%',
            changeLabel: 'geçen aya göre',
            icon: Clock,
            color: 'from-purple-500 to-pink-500',
            iconColor: 'text-purple-400',
        },
        {
            title: 'Anlık Kullanıcı',
            value: stats.liveUserCount,
            change: 'Şu an aktif',
            icon: Radio,
            color: 'from-green-500 to-emerald-500',
            iconColor: 'text-green-400',
            live: true,
        },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
            {cards.map((card) => (
                <motion.div
                    key={card.title}
                    variants={item}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-t border-l border-white/10 border-b border-white/5 border-r border-white/5"
                >
                    {/* Detailed Gradient Border for "Neon Glass" effect */}
                    <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/20 via-purple-500/0 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" style={{ zIndex: -1 }} />

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                            <div className="flex items-center mt-2">
                                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                                    {card.value}
                                </h3>
                                {card.live && (
                                    <div className="ml-3 flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={clsx("p-3 rounded-xl bg-white/5 border border-white/5", card.iconColor)}>
                            <card.icon size={24} />
                        </div>
                    </div>

                    {card.change && (
                        <div className="flex items-center text-sm">
                            <span className="text-green-400 font-semibold neon-text-green mr-2">{card.change}</span>
                            {card.changeLabel && <span className="text-gray-500">{card.changeLabel}</span>}
                        </div>
                    )}

                    {/* Decorative Glow */}
                    <div className={clsx("absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500", card.color)} />
                </motion.div>
            ))}
        </motion.div>
    );
};
