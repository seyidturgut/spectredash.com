import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import type { DeviceData } from '../types';

interface DeviceStatsProps {
    data: DeviceData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-2 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
                <p className="text-white font-medium text-sm">
                    {payload[0].name}: <span className="text-gray-300">{payload[0].value}%</span>
                </p>
            </div>
        );
    }
    return null;
};

export const DeviceStats: React.FC<DeviceStatsProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel p-6 rounded-2xl h-full border border-white/5 flex flex-col items-center justify-center relative relative overflow-hidden"
        >
            <h3 className="text-lg font-semibold text-white w-full text-left mb-2">Cihaz Dağılımı</h3>

            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-white">100%</span>
                    <span className="text-xs text-gray-500">Trafik</span>
                </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-6 space-y-3">
                {data.map((item) => (
                    <div key={item.name} className="flex justify-between items-center group cursor-default">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3 transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{item.name}</span>
                        </div>
                        <span className="text-white font-medium text-sm">{item.value}%</span>
                    </div>
                ))}
            </div>

            {/* Decorative Glow */}
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
    );
};
