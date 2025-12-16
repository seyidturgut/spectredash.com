import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { StatCards } from './components/StatCards';
import { TrafficChart } from './components/TrafficChart';
import { LiveVisitorFeed } from './components/LiveVisitorFeed';
import { DeviceStats } from './components/DeviceStats';
import { AdminCustomers } from './components/AdminCustomers';
import { DateRangePicker, type DateRangeOption } from './components/DateRangePicker';
import { ProfileModal } from './components/ProfileModal';
import { BackgroundOrbs } from './components/BackgroundOrbs';
import { LoginPage } from './components/LoginPage';
import { SettingsPage } from './components/SettingsPage';
import { GoalAnalytics } from './components/GoalAnalytics';
import { EventAnalytics } from './components/EventAnalytics';
import { HeatmapViewer } from './components/HeatmapViewer';
import type { Visitor, User, Stats } from './types';

function App() {
  // --- REAL DATA STATE INITIALIZATION ---
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    totalVisitsChange: 0,
    averageDuration: '0dk 0sn',
    liveUserCount: 0
  });

  const [trafficData, setTrafficData] = useState<{ name: string, visits: number }[]>([
    { name: 'Pzt', visits: 0 },
    { name: 'Sal', visits: 0 },
    { name: 'Çar', visits: 0 },
    { name: 'Per', visits: 0 },
    { name: 'Cum', visits: 0 },
    { name: 'Cmt', visits: 0 },
    { name: 'Paz', visits: 0 },
  ]);

  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const [deviceData, setDeviceData] = useState<{ name: string, value: number, color: string }[]>([
    { name: 'Masaüstü', value: 0, color: '#8B5CF6' },
    { name: 'Mobil', value: 0, color: '#EC4899' },
    { name: 'Tablet', value: 0, color: '#06B6D4' },
  ]);

  const [activeView, setActiveView] = useState('dashboard');

  // Auth State (with Persistence)
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('Son 7 Gün');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Role-Based Routing & Persistence Sync
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));

      // Auto-route on load if needed
      if (user.role === 'admin' && activeView === 'dashboard') {
        setActiveView('admin_customers');
      } else if (user.role === 'client' && activeView === 'admin_customers') {
        setActiveView('dashboard');
      }
    } else {
      localStorage.removeItem('user');
    }
  }, [user, activeView]);

  // --- FETCH REAL STATS ---
  const fetchStats = useCallback(async () => {
    if (!user || user.role !== 'client' || !user.site_id) return;

    try {
      const res = await fetch(`/api/stats.php?site_id=${user.site_id}`);
      const data = await res.json();

      // Update Stats
      setStats(prev => ({
        ...prev,
        totalVisits: data.total_visits || 0,
        averageDuration: data.average_duration || '0dk 0sn',
        liveUserCount: data.live_users || 0
      }));

      // Update Devices
      if (data.devices && data.devices.length > 0) {
        const newDeviceData = [
          { name: 'Masaüstü', value: 0, color: '#8B5CF6' },
          { name: 'Mobil', value: 0, color: '#EC4899' },
          { name: 'Tablet', value: 0, color: '#06B6D4' },
        ];

        const deviceMapping: Record<string, string> = {
          'Desktop': 'Masaüstü',
          'Mobile': 'Mobil',
          'Tablet': 'Tablet',
          'Laptop': 'Masaüstü' // Group Laptop with Desktop
        };

        data.devices.forEach((d: any) => {
          // Try direct match or mapped match
          const uiName = deviceMapping[d.device] || d.device;
          const index = newDeviceData.findIndex(item => item.name === uiName);

          if (index !== -1) {
            newDeviceData[index].value += parseInt(d.count); // += to handle merged categories
          }
        });
        setDeviceData(newDeviceData);
      }

      // Update Traffic Chart
      if (data.traffic_chart) {
        // Ensure data matches the expected format, although the API should send it correctly
        setTrafficData(data.traffic_chart);
      }

      // Update Feed
      if (data.recent_feed) {
        const newVisitors = data.recent_feed.map((v: any) => ({
          id: v.id,
          status: 'active',
          url: v.url,
          title: v.page_title,
          source: v.referrer || 'Direkt',
          device: v.device,
          timestamp: new Date(v.created_at).toLocaleTimeString()
        }));
        setVisitors(newVisitors);
      }

    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [user]);

  // Initial Fetch & Poll
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleDateRangeChange = (range: DateRangeOption) => {
    setSelectedRange(range);
    // TODO: Implement backend filtering by date
  };


  // If not logged in, show Login Page
  if (!user) {
    return (
      <div className="min-h-screen relative text-white selection:bg-purple-500/30">
        <BackgroundOrbs />
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white selection:bg-purple-500/30">
      <BackgroundOrbs />

      <DashboardLayout
        activeView={activeView as any}
        onNavigate={setActiveView as any}
        user={user}
        onLogout={handleLogout}
      >

        {/* CLIENT VIEW: DASHBOARD */}
        {activeView === 'dashboard' && user.role === 'client' && (
          <>
            {/* Dashboard Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  Genel Bakış
                </h1>
                <p className="text-gray-400">Tekrar hoş geldiniz, {user.contact_name || user.email}.</p>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                <DateRangePicker
                  selectedRange={selectedRange}
                  onRangeChange={handleDateRangeChange}
                />

                {/* Avatar Trigger */}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform border border-white/20"
                >
                  {(() => {
                    const name = user.contact_name || user.company_name || user.email || 'A';
                    return name.substring(0, 2).toUpperCase();
                  })()}
                </button>
              </div>
            </header>

            {/* Stats & Charts */}
            <StatCards stats={stats} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 h-full">
                <TrafficChart data={trafficData} />
              </div>
              <div className="lg:col-span-1 h-full">
                <DeviceStats data={deviceData} />
              </div>
            </div>

            {/* Live Feed Row */}
            <div className="mb-8 h-[500px]">
              <LiveVisitorFeed visitors={visitors} />
            </div>
          </>
        )}

        {/* CLIENT VIEW: REALTIME */}
        {activeView === 'realtime' && user.role === 'client' && (
          <div className="space-y-6">
            <header>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
                Gerçek Zamanlı Trafik
              </h1>
              <p className="text-gray-400">Anlık ziyaretçi akışını izleyin.</p>
            </header>
            <div className="h-[600px]">
              <LiveVisitorFeed visitors={visitors} />
            </div>
          </div>
        )}

        {/* ADMIN VIEW: CUSTOMERS */}
        {activeView === 'admin_customers' && user.role === 'admin' && (
          <AdminCustomers />
        )}

        {/* SHARED: SETTINGS */}
        {activeView === 'settings' && <SettingsPage user={user} />}

        {/* ANALYTICS: GOALS */}
        {activeView === 'goals' && user.site_id && (
          <GoalAnalytics siteId={user.site_id} />
        )}

        {/* ANALYTICS: EVENTS */}
        {activeView === 'events' && user.site_id && (
          <EventAnalytics siteId={user.site_id} />
        )}

        {/* ANALYTICS: HEATMAP */}
        {activeView === 'heatmap' && user.site_id && (
          <HeatmapViewer siteId={user.site_id} />
        )}

      </DashboardLayout>

      {/* Global Modals */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
    </div>
  );
}

export default App;
