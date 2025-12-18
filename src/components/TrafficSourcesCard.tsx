import { motion } from 'framer-motion';
import { Globe, Search } from 'lucide-react';
import { formatNumber } from '../utils/labels';

interface Source {
    utm_source: string | null;
    utm_medium: string;
    count: number;
}

interface Term {
    utm_term: string;
    count: number;
}

interface TrafficSourcesCardProps {
    sources: Source[];
    terms: Term[];
}

export function TrafficSourcesCard({ sources = [], terms = [] }: TrafficSourcesCardProps) {

    // Helper to get icon
    const getSourceIcon = (source: string | null) => {
        if (!source) return 'text-gray-400';
        const s = source.toLowerCase();
        if (s.includes('google')) return 'text-blue-400';
        if (s.includes('youtube')) return 'text-red-500';
        if (s.includes('facebook') || s.includes('instagram')) return 'text-pink-500';
        if (s.includes('twitter') || s.includes('t.co')) return 'text-sky-400';
        if (s.includes('linkedin')) return 'text-blue-600';
        return 'text-green-400';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl border border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Trafik Kaynakları</h3>
                        <p className="text-xs text-gray-400">Ziyaretçiler nereden geliyor?</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {sources.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">Veri yok</div>
                    ) : (
                        sources.map((source, index) => (
                            <div key={index} className="group">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getSourceIcon(source.utm_source)} bg-current`} />
                                        <span className="text-gray-200 font-medium">
                                            {source.utm_source || 'Direkt / Bilinmiyor'}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                                            {source.utm_medium || 'N/A'}
                                        </span>
                                    </div>
                                    <span className="text-white font-mono">{formatNumber(source.count)}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-current ${getSourceIcon(source.utm_source)} opacity-70`}
                                        style={{ width: `${(source.count / sources[0].count) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Search Terms */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 rounded-2xl border border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Search size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Arama Terimleri</h3>
                        <p className="text-xs text-gray-400">Hangi kelimelerle bulundunuz?</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {terms.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            <p>Henüz arama verisi yok.</p>
                            <p className="text-xs mt-1 text-gray-600">Google kelimeleri gizler, diğer motorlar bekleniyor.</p>
                        </div>
                    ) : (
                        terms.map((term, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-purple-400 text-xs font-mono opacity-50">#{index + 1}</span>
                                    <span className="text-gray-200 truncate">{term.utm_term}</span>
                                </div>
                                <span className="text-white font-mono bg-black/20 px-2 py-0.5 rounded text-xs">
                                    {formatNumber(term.count)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {terms.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Search size={12} className="text-purple-400" />
                            <span>Kelimeleri yakalamak için tracker optimize edildi.</span>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
