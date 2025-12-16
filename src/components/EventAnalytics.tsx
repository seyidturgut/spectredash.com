import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Share2, FileText, MousePointer, Filter, ArrowUpRight, Sparkles, Brain } from 'lucide-react';
import { getEventLabel, getCategoryLabel, getDateRangeLabel, formatNumber } from '../utils/labels';

interface Event {
    event_name: string;
    event_category: string;
    event_label: string | null;
    count: number;
    total_value: number;
    last_event: string;
}

interface EventAnalyticsProps {
    siteId: string;
}

const CATEGORY_ICONS: Record<string, any> = {
    'engagement': MousePointer,
    'media': Activity,
    'social': Share2,
    'general': FileText,
    'test': Zap
};

const CATEGORY_COLORS: Record<string, string> = {
    'engagement': 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
    'media': 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
    'social': 'text-pink-400 bg-pink-500/10 border-pink-500/20 group-hover:border-pink-500/40',
    'general': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
    'test': 'text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/40'
};

export function EventAnalytics({ siteId }: EventAnalyticsProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [dateRange, setDateRange] = useState('7d');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // AI States
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [siteId, dateRange, selectedCategory]);

    const fetchEvents = async () => {
        try {
            const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
            const res = await fetch(`/api/events/stats.php?site_id=${siteId}&range=${dateRange}${categoryParam}`);
            const data = await res.json();
            setEvents(data.events || []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiAnalyze = async () => {
        setIsAnalyzing(true);
        setAiInsight(null);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ site_id: siteId })
            });
            const data = await res.json();
            if (data.ai_insight) {
                setAiInsight(data.ai_insight);
            } else {
                setAiInsight("Analiz yapılamadı. API Key eksik olabilir.");
            }
        } catch (err) {
            console.error(err);
            setAiInsight("Bir hata oluştu.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const totalEvents = events.reduce((sum, e) => sum + e.count, 0);
    const categories = ['all', 'engagement', 'media', 'social', 'general'];

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-white inline-block mb-2">
                        Olay Takibi
                    </h1>
                    <p className="text-gray-400">
                        Kullanıcılarınızın sitenizle nasıl etkileşime girdiğini keşfedin.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Time Range */}
                    <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex items-center">
                        {['24h', '7d', '30d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${dateRange === range
                                    ? 'bg-white/10 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {getDateRangeLabel(range)}
                            </button>
                        ))}
                    </div>

                    {/* AI Button */}
                    <button
                        onClick={handleAiAnalyze}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        <span>{isAnalyzing ? 'Analiz Ediliyor...' : 'Yapay Zeka Analizi'}</span>
                    </button>
                </div>
            </div>

            {/* AI Insight Card */}
            <AnimatePresence>
                {aiInsight && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain size={120} />
                        </div>
                        <div className="flex gap-4 relative z-10">
                            <div className="p-3 bg-indigo-500/20 rounded-xl h-fit text-indigo-300">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Spectre AI Görüşü</h3>
                                <p className="text-indigo-100 leading-relaxed text-lg">
                                    "{aiInsight}"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-24 relative overflow-hidden group">
                    <div className="z-10">
                        <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">Toplam İşlem</span>
                        <div className="text-3xl font-bold text-white mt-1">{formatNumber(totalEvents)}</div>
                    </div>
                    <Activity className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/10 w-16 h-16 group-hover:scale-110 transition-transform" />
                </div>
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-24 relative overflow-hidden group">
                    <div className="z-10">
                        <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">Olay Çeşidi</span>
                        <div className="text-3xl font-bold text-white mt-1">{events.length}</div>
                    </div>
                    <Zap className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500/10 w-16 h-16 group-hover:scale-110 transition-transform" />
                </div>
                {/* Add more KPI cards if needed */}
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="p-2 bg-white/5 rounded-lg mr-2">
                        <Filter size={16} className="text-gray-400" />
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${selectedCategory === cat
                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                : 'bg-black/20 text-gray-500 border-white/5 hover:border-white/20 hover:text-gray-300'
                                }`}
                        >
                            {cat === 'all' ? 'Tümü' : getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>

                {/* Compact Grid Layout */}
                {isLoading ? (
                    <div className="h-40 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="glass-panel p-16 text-center rounded-3xl border-dashed border border-white/10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <Zap size={24} />
                        </div>
                        <p className="text-gray-400">Bu kategoride henüz bir olay gerçekleşmedi.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {events.map((event, index) => {
                                const Icon = CATEGORY_ICONS[event.event_category] || Activity;
                                const styleClass = CATEGORY_COLORS[event.event_category] || CATEGORY_COLORS['test'];

                                return (
                                    <motion.div
                                        layout
                                        key={`${event.event_name}-${index}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative glass-panel p-0 rounded-2xl overflow-hidden hover:bg-white/5 transition-all border border-white/5 hover:border-white/10"
                                    >
                                        <div className="p-5 flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl border ${styleClass} transition-colors shadow-inner`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white text-lg leading-tight mb-1">
                                                        {getEventLabel(event.event_name)}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="capitalize px-1.5 py-0.5 rounded bg-white/5">
                                                            {getCategoryLabel(event.event_category)}
                                                        </span>
                                                        {event.event_label && (
                                                            <span className="truncate max-w-[120px]" title={event.event_label}>
                                                                • {event.event_label === 'LCP' ? 'Açılış Hızı (LCP)' :
                                                                    event.event_label === 'FID' ? 'Tepki Süresi (FID)' :
                                                                        event.event_label === 'CLS' ? 'Görsel Kayma (CLS)' : event.event_label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-bold text-white tracking-tight">
                                                    {formatNumber(event.count)}
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">İşlem</span>
                                            </div>
                                        </div>

                                        {/* Footer / Gradient Line */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Hover Action Icon */}
                                        <div className="absolute top-4 right-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                            <ArrowUpRight size={16} className="text-gray-500" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
