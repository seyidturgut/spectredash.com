import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Menu } from 'lucide-react';
import type { User } from '../types';
import { AiHeaderButton } from '../components/AiHeaderButton';
import { AiSummaryModal } from '../components/AiSummaryModal';
import { LiveUserBadge } from '../components/LiveUserBadge';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeView: 'dashboard' | 'settings' | 'admin_sites';
    onNavigate: (view: 'dashboard' | 'settings' | 'admin_sites') => void;
    user: User | null;
    onLogout: () => void;
    liveUserCount: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeView, onNavigate, user, onLogout, liveUserCount }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    const handleAiAnalyze = async () => {
        setIsAiModalOpen(true);
        setAiLoading(true);
        setAiInsight(null);

        // Get Site ID from User Prop
        const siteId = user?.site_id;

        if (!siteId) {
            setAiInsight("Hata: Site ID bulunamadı. Lütfen giriş yaptığınızdan emin olun.");
            setAiLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/analyze.php', { // Ensure .php extension if needed
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ site_id: siteId })
            });
            const data = await res.json();
            if (data.ai_insight) {
                setAiInsight(data.ai_insight);
            } else {
                setAiInsight("Analiz oluşturulamadı. (Veri yetersiz veya API hatası)");
            }
        } catch (e) {
            setAiInsight("Bağlantı hatası oluştu.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen relative">
            <Sidebar
                activeView={activeView}
                onNavigate={onNavigate}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
                user={user}
                onLogout={onLogout}
            />

            {/* Mobile Header Trigger */}
            <div className="lg:hidden absolute top-6 right-6 z-30 flex gap-3 items-center">
                <LiveUserBadge count={liveUserCount} />
                <AiHeaderButton onClick={handleAiAnalyze} isLoading={aiLoading} />
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-white"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Desktop Header Actions (Absolute Top Right) */}
            <div className="hidden lg:flex absolute top-8 right-8 z-30 items-center gap-4">
                <LiveUserBadge count={liveUserCount} />
                <AiHeaderButton onClick={handleAiAnalyze} isLoading={aiLoading} />
            </div>

            <main className="flex-1 lg:ml-64 p-4 md:p-8 relative z-0">
                <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0">
                    {children}
                </div>
            </main>

            <AiSummaryModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                isLoading={aiLoading}
                insight={aiInsight}
            />
        </div>
    );
};
