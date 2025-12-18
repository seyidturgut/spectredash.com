import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Smartphone, Monitor, ArrowRight } from 'lucide-react';
import type { Visitor } from '../types';

interface LiveVisitorFeedProps {
    visitors: Visitor[];
}

const getDeviceIcon = (device: string) => {
    switch (device) {
        case 'Mobil': return <Smartphone size={18} className="text-pink-400" />;
        case 'Tablet': return <Monitor size={18} className="text-blue-400" />;
        default: return <Monitor size={18} className="text-purple-400" />;
    }
};

const getSourceColor = (source: string) => {
    if (source.includes('google')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (source.includes('instagram')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    if (source.includes('facebook')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (source === 'Direkt') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
};

export const LiveVisitorFeed: React.FC<LiveVisitorFeedProps> = ({ visitors }) => {
    return (
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-4 md:p-6 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Canlı Akış
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 ml-6">Şu an sitenizde olan ziyaretçiler</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm">
                    {visitors.length} Aktif
                </div>
            </div>

            {/* Stream List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {visitors.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-48 text-gray-500 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Globe size={24} className="opacity-50" />
                            </div>
                            <p>Henüz aktif ziyaretçi yok.<br />Radarlarımız açık bekliyoruz...</p>
                        </motion.div>
                    ) : (
                        visitors.map((visitor) => (
                            <motion.div
                                key={visitor.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative p-4 rounded-2xl bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 border border-white/5 hover:border-white/10 transition-all cursor-default"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon Box */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-black/40 border border-white/5 shadow-inner`}>
                                        {getDeviceIcon(visitor.device)}
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-white truncate pr-2" title={visitor.title || visitor.url}>
                                                {visitor.title || 'İsimsiz Sayfa'}
                                            </h4>
                                            <span className="text-xs font-medium text-gray-500 bg-black/40 px-2 py-1 rounded-md whitespace-nowrap">
                                                {visitor.timestamp}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium ${getSourceColor(visitor.source)}`}>
                                                <ArrowRight size={10} />
                                                {visitor.source}
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span className="truncate text-xs opacity-70 font-mono">{new URL(visitor.url).pathname}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Indicator Bar */}
                                {visitor.status === 'active' && (
                                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-green-500 rounded-r-md shadow-[0_0_10px_rgba(34,197,94,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
    );
};
