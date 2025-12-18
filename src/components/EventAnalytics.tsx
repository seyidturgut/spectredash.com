import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertOctagon, AlertTriangle, Info, Terminal, Search } from 'lucide-react';
import { getEventLabel, getDateRangeLabel, formatNumber, getEventSeverity, getSelectorLabel } from '../utils/labels';

interface Event {
    event_name: string;
    event_category: string;
    event_label: string | null;
    count: number;
    total_value: number;
    url: string;
    last_event: string;
}

interface EventAnalyticsProps {
    siteId: string;
}

// Severity Styles
const SEVERITY_STYLES: Record<string, any> = {
    'critical': {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        hoverBorder: 'group-hover:border-red-500/40',
        icon: AlertOctagon
    },
    'warning': {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        hoverBorder: 'group-hover:border-orange-500/40',
        icon: AlertTriangle
    },
    'info': {
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        hoverBorder: 'group-hover:border-blue-500/40',
        icon: Activity
    }
};

export function EventAnalytics({ siteId }: EventAnalyticsProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [dateRange, setDateRange] = useState('7d');
    const [activeTab, setActiveTab] = useState<'critical' | 'warning' | 'info' | 'all'>('critical');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [siteId, dateRange]);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            // We fetch all and filter client side for smooth UI
            const res = await fetch(`/api/events/stats.php?site_id=${siteId}&range=${dateRange}`);
            const data = await res.json();
            setEvents(data.events || []);

            // Auto-switch tab if critical events exist
            const hasCritical = (data.events || []).some((e: Event) => getEventSeverity(e.event_name) === 'critical');
            const hasWarning = (data.events || []).some((e: Event) => getEventSeverity(e.event_name) === 'warning');

            if (hasCritical) setActiveTab('critical');
            else if (hasWarning) setActiveTab('warning');
            else setActiveTab('all');

        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter events based on active tab
    const filteredEvents = events.filter(e => {
        if (activeTab === 'all') return true;

        const severity = getEventSeverity(e.event_name);

        // Group 'info' and other random stuff into 'info' tab or 'all'
        if (activeTab === 'info') return severity === 'info';

        return severity === activeTab;
    });

    const counts = {
        critical: events.filter(e => getEventSeverity(e.event_name) === 'critical').length,
        warning: events.filter(e => getEventSeverity(e.event_name) === 'warning').length,
        info: events.filter(e => getEventSeverity(e.event_name) === 'info').length
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Olay Takibi
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        Kullanıcılarınızın sitenizle nasıl etkileşime girdiğini ve <span className="text-gray-200">nerede takıldıklarını</span> keşfedin.
                    </p>
                </div>

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
            </div>

            {/* Severity Tabs */}
            <div className="flex items-center gap-4 border-b border-white/10 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('critical')}
                    className={`pb-4 px-2 flex items-center gap-2 transition-all border-b-2 ${activeTab === 'critical'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <AlertOctagon size={18} />
                    <span className="font-medium">Kritik Sorunlar</span>
                    {counts.critical > 0 && (
                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{counts.critical}</span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('warning')}
                    className={`pb-4 px-2 flex items-center gap-2 transition-all border-b-2 ${activeTab === 'warning'
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <AlertTriangle size={18} />
                    <span className="font-medium">İyileştirmeler</span>
                    {counts.warning > 0 && (
                        <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">{counts.warning}</span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-4 px-2 flex items-center gap-2 transition-all border-b-2 ${activeTab === 'all'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <Activity size={18} />
                    <span className="font-medium">Tüm Aktiviteler</span>
                    <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full">{events.length}</span>
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="h-40 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="glass-panel p-16 text-center rounded-3xl border-dashed border border-white/10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <Info size={24} />
                        </div>
                        <p className="text-gray-400">
                            {activeTab === 'critical'
                                ? 'Harika! Kritik bir sorun bulunamadı.'
                                : 'Bu kategoride henüz bir veri yok.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence mode="popLayout">
                            {filteredEvents.map((event, index) => {
                                const severity = getEventSeverity(event.event_name);
                                const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES['info'];
                                const Icon = styles.icon;
                                const readableLabel = getSelectorLabel(event.event_label);

                                return (
                                    <motion.div
                                        layout
                                        key={`${event.event_name}-${event.event_label}-${index}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`glass-panel p-4 rounded-xl border ${styles.border} ${styles.hoverBorder} flex items-center justify-between group transition-all`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${styles.bg} ${styles.color}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-white text-lg">
                                                        {getEventLabel(event.event_name)}
                                                    </h4>
                                                    {severity === 'critical' && (
                                                        <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">Acil</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mt-1">
                                                    {event.event_label && (
                                                        <>
                                                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-gray-300">
                                                                <Terminal size={12} className="opacity-50" />
                                                                <span className="font-mono text-xs">{readableLabel !== event.event_label ? readableLabel : event.event_label}</span>
                                                            </div>
                                                            {readableLabel !== event.event_label && (
                                                                <span className="text-xs text-gray-600 font-mono hidden md:inline">({event.event_label})</span>
                                                            )}
                                                        </>
                                                    )}
                                                    <span className="text-gray-600">•</span>
                                                    <span>{formatNumber(event.count)} kez</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-sm text-gray-400">Son İşlem</div>
                                                <div className="text-gray-200 text-sm font-mono">
                                                    {new Date(event.last_event).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <a
                                                href={event.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors"
                                                title="Sayfaya Git"
                                            >
                                                <Search size={18} />
                                            </a>
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
