import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Globe, Loader2, AlertCircle } from 'lucide-react';

interface Site {
    id: number;
    site_id: string;
    domain: string;
    created_at: string;
}

export const AdminSites = () => {
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newDomain, setNewDomain] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/sites');
            const data = await res.json();
            setSites(data);
        } catch (err) {
            console.error(err);
            setError('Siteler yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain) return;

        setIsCreating(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:3001/api/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newDomain }),
            });
            const data = await res.json();
            if (res.ok) {
                setSites([data.site, ...sites]);
                setNewDomain('');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu siteyi silmek istediğinize emin misiniz?')) return;

        try {
            await fetch(`http://localhost:3001/api/sites/${id}`, { method: 'DELETE' });
            setSites(sites.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
            alert('Silme işlemi başarısız');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Site Yönetimi</h1>
                    <p className="text-gray-400">Müşteri sitelerini ekleyin ve yönetin.</p>
                </div>
            </div>

            {/* Create New Site */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <form onSubmit={handleCreate} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm text-gray-400">Yeni Site Domain</label>
                        <input
                            type="text"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            placeholder="ornek-site.com"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating || !newDomain}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus size={20} />}
                        Ekle
                    </button>
                </form>
                {error && (
                    <div className="mt-4 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>

            {/* Sites List */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
                ) : sites.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Henüz site eklenmemiş.</div>
                ) : (
                    sites.map((site) => (
                        <motion.div
                            key={site.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{site.domain}</h3>
                                    <code className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded-md">
                                        {site.site_id}
                                    </code>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(site.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
