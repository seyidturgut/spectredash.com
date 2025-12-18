import { motion } from 'framer-motion';
import { TrendingUp, FileText, ExternalLink } from 'lucide-react';

interface PopularPage {
    page_title: string;
    url: string;
    count: number;
}

interface PopularPagesProps {
    pages?: PopularPage[];
}

export const PopularPages: React.FC<PopularPagesProps> = ({ pages = [] }) => {
    // Find max for bar calculation
    const maxCount = pages.length > 0 ? Math.max(...pages.map(p => Number(p.count))) : 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-4 md:p-5 rounded-2xl w-full h-full flex flex-col border border-white/5 relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Popüler Sayfalar</h3>
                        <p className="text-xs text-gray-400">En çok ziyaret edilen içerikler</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {pages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
                        <FileText size={48} className="mb-3 opacity-20" />
                        <p className="text-sm">Henüz veri yok</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pages.map((page, index) => (
                            <div key={index} className="group">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium text-gray-200 truncate" title={page.page_title || page.url}>
                                                {page.page_title || 'İsimsiz Sayfa'}
                                            </h4>
                                            <a
                                                href={page.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate font-mono">{new URL(page.url).pathname}</p>
                                    </div>
                                    <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/10">
                                        {page.count}
                                    </span>
                                </div>
                                {/* Bar */}
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(Number(page.count) / maxCount) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 + (index * 0.05) }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
