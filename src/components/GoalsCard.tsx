import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface GoalData {
    goal_name: string;
    count: number;
}

interface GoalsCardProps {
    goals?: GoalData[];
    totalVisits: number;
}

export const GoalsCard: React.FC<GoalsCardProps> = ({ goals = [], totalVisits = 1 }) => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-5 rounded-2xl w-full h-full flex flex-col border border-white/5 relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Hedef Dönüşümleri</h3>
                        <p className="text-xs text-gray-400">Ziyaretçi Dönüşüm Oranları</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center">
                {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 py-4">
                        <Target size={48} className="mb-3 opacity-20" />
                        <p className="text-sm">Şu anda hiçbir hedef tanımlanmamış</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal, index) => {
                            const percent = totalVisits > 0 ? ((Number(goal.count) / totalVisits) * 100).toFixed(2) : '0.00';

                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white font-medium">{goal.goal_name}</span>
                                        <span className="text-purple-400 font-bold">%{percent}</span>
                                    </div>
                                    {/* Simple Bar */}
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(Number(percent), 100)}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Warning Note if Empty */}
            {goals.length === 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            )}
        </motion.div>
    );
};
