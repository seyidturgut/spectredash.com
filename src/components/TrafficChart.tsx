import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';
import type { TrafficData } from '../types';

interface TrafficChartProps {
    data: TrafficData[];
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
    const maxVisits = Math.max(...data.map(d => d.visits), 10); // Min max 10 to avoid full height on small numbers
    const totalVisits = data.reduce((sum, d) => sum + d.visits, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-5 rounded-2xl w-full h-full flex flex-col border border-white/5 relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Trafik Özeti</h3>
                        <p className="text-xs text-gray-400">Son 7 gün</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xl font-bold text-white block">{totalVisits.toLocaleString()}</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-[128px] flex items-end justify-between gap-2 md:gap-4 mt-2">
                {data.map((item, index) => (
                    <div key={item.name} className="group relative flex-1 flex flex-col items-center gap-2">
                        {/* Tooltip */}
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 border border-white/10 text-xs px-2 py-1 rounded shadow-xl text-white whitespace-nowrap z-10 pointer-events-none">
                            {item.visits} ziyaret
                        </div>

                        {/* Bar Track */}
                        <div className="w-full bg-white/5 rounded-t-xl relative overflow-hidden h-full flex items-end hover:bg-white/10 transition-colors">
                            {/* Bar Fill */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.visits / maxVisits) * 100}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 15, delay: index * 0.05 }}
                                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 opacity-80 group-hover:opacity-100 transition-opacity rounded-t-sm min-h-[4px]"
                            />
                        </div>

                        {/* Label */}
                        <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* Empty State Overlay if all 0 */}
            {totalVisits === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-2xl pointer-events-none">
                    <p className="text-xs text-gray-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        Henüz veri yok
                    </p>
                </div>
            )}
        </motion.div>
    );
};
