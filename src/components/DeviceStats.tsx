import { motion } from 'framer-motion';
import { Monitor, Smartphone, Tablet, Laptop } from 'lucide-react';
import type { DeviceData } from '../types';

interface DeviceStatsProps {
    data: DeviceData[];
}

const DEVICE_ICONS: Record<string, any> = {
    'Desktop': Monitor,
    'Mobile': Smartphone,
    'Tablet': Tablet,
    'Laptop': Laptop
};

export const DeviceStats: React.FC<DeviceStatsProps> = ({ data }) => {
    // Sort data by value for better presentation
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel p-6 rounded-2xl h-full border border-white/5 flex flex-col relative overflow-hidden"
        >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Monitor size={20} className="text-purple-400" />
                Cihaz Dağılımı
            </h3>

            <div className="flex-1 flex flex-col justify-center space-y-5">
                {sortedData.map((item, index) => {
                    const Icon = DEVICE_ICONS[item.name] || Monitor;

                    return (
                        <div key={item.name} className="space-y-2 group">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <Icon size={16} style={{ color: item.color }} />
                                    </div>
                                    <span className="text-gray-300 font-medium">{item.name}</span>
                                </div>
                                <span className="text-white font-bold">{item.value}%</span>
                            </div>

                            {/* Custom Progress Bar */}
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 1, delay: 0.6 + (index * 0.1) }}
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor: item.color,
                                        boxShadow: `0 0 10px ${item.color}40`
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Decorative Glow */}
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
    );
};
