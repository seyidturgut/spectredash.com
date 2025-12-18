import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign } from 'lucide-react';
import { getGoalLabel, getDateRangeLabel, formatNumber, formatCurrency, METRIC_EXPLANATIONS } from '../utils/labels';

interface Goal {
    goal_name: string;
    count: number;
    total_value: number;
    avg_value: number;
    last_conversion: string;
}

interface GoalAnalyticsProps {
    siteId: string;
}

export function GoalAnalytics({ siteId }: GoalAnalyticsProps) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [dateRange, setDateRange] = useState('7d');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, [siteId, dateRange]);

    const fetchGoals = async () => {
        try {
            const res = await fetch(`/api/goals/stats.php?site_id=${siteId}&range=${dateRange}`);
            const data = await res.json();
            setGoals(data.goals || []);
        } catch (err) {
            console.error('Failed to fetch goals:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const totalConversions = goals.reduce((sum, g) => sum + g.count, 0);
    const totalValue = goals.reduce((sum, g) => sum + g.total_value, 0);
    const maxCount = Math.max(...goals.map(g => g.count), 1); // For bar widths

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                            <Target size={24} />
                        </span>
                        Hedef Analizi
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl">
                        Dönüşüm performansınızı ve hedef metriklerinizi buradan takip edebilirsiniz.
                    </p>
                </div>

                <div className="glass-panel px-1 p-1 rounded-xl flex items-center gap-1 bg-black/40">
                    {['24h', '7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === range
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {getDateRangeLabel(range)}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Toplam Dönüşüm"
                    value={formatNumber(totalConversions)}
                    icon={Target}
                    color="purple"
                    explanation={METRIC_EXPLANATIONS.total_conversions}
                />
                <KPICard
                    title="Toplam Değer"
                    value={formatCurrency(totalValue)}
                    icon={DollarSign}
                    color="green"
                    explanation={METRIC_EXPLANATIONS.total_value}
                />
                <KPICard
                    title="Ortalama Değer"
                    value={totalConversions > 0 ? formatCurrency(totalValue / totalConversions) : formatCurrency(0)}
                    icon={TrendingUp}
                    color="blue"
                    explanation={METRIC_EXPLANATIONS.avg_value}
                />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List - Custom Bars */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                        Hedef Dağılımı
                    </h3>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Yükleniyor...
                        </div>
                    ) : goals.length > 0 ? (
                        <div className="space-y-3">
                            {goals.map((goal, index) => (
                                <motion.div
                                    key={goal.goal_name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    {/* Progress Background */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500/10 to-purple-500/5 transition-all duration-1000"
                                        style={{ width: `${(goal.count / maxCount) * 100}%` }}
                                    />

                                    <div className="relative p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors shrink-0">
                                                <Target size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-white text-lg truncate pr-2">
                                                    {getGoalLabel(goal.goal_name)}
                                                </h4>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span>{goal.count} işlem</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                    <span>Son: {new Date(goal.last_conversion).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right pl-[3.5rem] sm:pl-0">
                                            <div className="font-bold text-white text-lg font-mono">
                                                {formatCurrency(goal.total_value)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 bg-black/30 px-2 py-1 rounded inline-block">
                                                Ort: {formatCurrency(goal.total_value / (goal.count || 1))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel p-12 text-center rounded-2xl">
                            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">Henüz kaydedilmiş bir hedef yok.</p>
                        </div>
                    )}
                </div>

                {/* Right Panel - Insights or Breakdown */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent">
                        <h3 className="text-lg font-semibold text-white mb-4">Özet</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <span className="text-gray-400">En Aktif Hedef</span>
                                <span className="text-white font-medium">
                                    {goals.length > 0 ? getGoalLabel(goals[0].goal_name) : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <span className="text-gray-400">Dönüşüm Oranı</span>
                                <span className="text-green-400 font-medium">
                                    %2.4 <span className="text-xs text-green-500/50">↗</span>
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-gray-300 mb-3 block">Hızlı İpuçları</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Dönüşüm oranlarını artırmak için 'Satın Alma' sayfalarındaki buton renklerini test edebilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// KPI Card Component
function KPICard({ title, value, icon: Icon, color, explanation }: any) {
    const colorClasses = {
        purple: "text-purple-400 bg-purple-500/10",
        green: "text-green-400 bg-green-500/10",
        blue: "text-blue-400 bg-blue-500/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-all"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 font-medium text-sm mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${(colorClasses as any)[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                {explanation}
            </p>
        </motion.div>
    );
}
