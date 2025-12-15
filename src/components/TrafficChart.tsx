import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

import type { TrafficData } from '../types';

interface TrafficChartProps {
    data: TrafficData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-3 rounded-lg border border-white/10 shadow-xl">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-blue-400 font-bold text-lg">
                    {payload[0].value.toLocaleString()}
                    <span className="text-xs text-gray-500 font-normal ml-1">sayfa</span>
                </p>
            </div>
        );
    }
    return null;
};

export const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-4 md:p-6 rounded-2xl w-full border border-white/5 relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-white">Trafik Özeti</h3>


            </div>

            {/* Chart */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 0,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                        <Area
                            type="monotone"
                            dataKey="visits"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorVisits)"
                            strokeWidth={3}
                            activeDot={{ r: 6, fill: "#60a5fa", stroke: "#1e3a8a", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Decorative Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
    );
};
