import { motion } from 'framer-motion';
import { Globe, Smartphone, Monitor } from 'lucide-react';
import type { Visitor } from '../types';

interface LiveVisitorFeedProps {
    visitors: Visitor[];
}

const getDeviceIcon = (device: string) => {
    switch (device) {
        case 'Mobil': return <Smartphone size={16} />;
        case 'Tablet': return <Monitor size={16} />;
        default: return <Monitor size={16} />;
    }
};

export const LiveVisitorFeed: React.FC<LiveVisitorFeedProps> = ({ visitors }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6 rounded-2xl h-full border border-white/5 relative overflow-hidden"
        >
            <h3 className="text-lg font-semibold text-white mb-6">Canlı Ziyaretçi Akışı</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 text-sm border-b border-white/5">
                            <th className="pb-3 pl-4 font-medium">Durum</th>
                            <th className="pb-3 font-medium">Sayfa</th>
                            <th className="pb-3 font-medium">Kaynak</th>
                            <th className="pb-3 font-medium">Cihaz</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {visitors.map((visitor) => (
                            <motion.tr
                                key={visitor.id}
                                layout
                                initial={{ opacity: 0, x: -20, backgroundColor: "rgba(74, 222, 128, 0.2)" }}
                                animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                                transition={{ duration: 0.5 }}
                                className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            >
                                <td className="py-4 pl-4">
                                    <div className="flex items-center">
                                        <div className="relative flex h-2.5 w-2.5 mr-3">
                                            {visitor.status === 'active' && (
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            )}
                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${visitor.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-white transition-colors">{visitor.timestamp}</span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="text-white font-medium truncate max-w-[150px] block" title={visitor.url}>
                                        {visitor.url}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center text-gray-400">
                                        <Globe size={14} className="mr-2 text-blue-400" />
                                        {visitor.source}
                                    </div>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center text-gray-400">
                                        <span className="mr-2 opacity-70">{getDeviceIcon(visitor.device)}</span>
                                        {visitor.device}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Subtle bottom gradient */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </motion.div>
    );
};
