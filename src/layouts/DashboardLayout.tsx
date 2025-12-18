import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Menu } from 'lucide-react';
import type { User } from '../types';

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

    return (
        <div className="flex min-h-screen relative overflow-x-hidden">
            <Sidebar
                activeView={activeView}
                onNavigate={onNavigate}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
                user={user}
                onLogout={onLogout}
                liveUserCount={liveUserCount}
            />

            {/* Mobile Header Trigger */}
            <div className="lg:hidden absolute top-6 right-6 z-30 flex gap-3 items-center">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-white"
                >
                    <Menu size={24} />
                </button>
            </div>

            <main className="flex-1 lg:ml-64 p-4 md:p-8 relative z-0 overflow-x-hidden w-full max-w-full">
                <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0">
                    {children}
                </div>
            </main>

        </div>
    );
};
