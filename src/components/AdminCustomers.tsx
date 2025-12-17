import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Loader2, AlertCircle, Edit2, Ban, CheckCircle, X, Globe, Users2, Target, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import type { User as AppUser } from '../types';
import { GoalManager } from './GoalManager';
import { GoalAnalytics } from './GoalAnalytics';

interface ExtendedUser extends AppUser {
    site_id?: string;
    domain?: string;
    last_active_at?: string;
    is_suspended?: boolean;
}

export const AdminCustomers = () => {
    const [customers, setCustomers] = useState<ExtendedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit State
    const [editingCustomer, setEditingCustomer] = useState<ExtendedUser | null>(null);
    const [editTab, setEditTab] = useState<'details' | 'goals'>('details');

    const [editForm, setEditForm] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        password: '',
        domain: ''
    });

    // Create State
    const [createForm, setCreateForm] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        password: '',
        domain: ''
    });

    const [verifyingId, setVerifyingId] = useState<number | null>(null);

    useEffect(() => {
        fetchCustomers();
        const interval = setInterval(fetchCustomers, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-open modal if returning from Visual Picker
    useEffect(() => {
        if (customers.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const editId = params.get('edit_customer_id');
            const openGoals = params.get('new_selector');

            if (editId) {
                const customer = customers.find(c => c.id === Number(editId));
                if (customer) {
                    setEditingCustomer(customer);
                    if (openGoals) setEditTab('goals');
                }
            }
        }
    }, [customers]);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers/index.php');
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/customers/index.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm),
            });
            const data = await res.json();

            if (res.ok) {
                fetchCustomers();
                setCreateForm({
                    company_name: '',
                    contact_name: '',
                    email: '',
                    password: '',
                    domain: ''
                });
            } else {
                throw new Error(data.error || 'Oluşturma başarısız');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu müşteriyi ve tüm verilerini silmek istediğinize emin misiniz?')) return;

        try {
            await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Silme işlemi başarısız');
        }
    };

    const handleSuspend = async (id: number, currentStatus: boolean) => {
        try {
            await fetch(`/api/customers/${id}/suspend`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_suspended: !currentStatus })
            });
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Durum güncelleme başarısız');
        }
    };

    const startEdit = (customer: ExtendedUser) => {
        setEditingCustomer(customer);
        setEditTab('details');
        setEditForm({
            company_name: customer.company_name || '',
            contact_name: customer.contact_name || '',
            email: customer.email,
            password: '', // Leave empty to keep unchanged
            domain: customer.domain || ''
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;

        setIsSubmitting(true);
        try {
            await fetch(`/api/customers/${editingCustomer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            fetchCustomers();
            setEditingCustomer(null);
        } catch (err) {
            console.error(err);
            alert('Güncelleme hatası');
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifySite = async (id: number) => {
        setVerifyingId(id);
        try {
            const res = await fetch(`/api/customers/${id}/verify`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                fetchCustomers();
            } else {
                alert(data.error || 'Doğrulama başarısız');
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası');
        } finally {
            setVerifyingId(null);
        }
    };

    const isActive = (lastActive: string | null | undefined) => {
        if (!lastActive) return false;
        const diff = Date.now() - new Date(lastActive).getTime();
        return diff < 10 * 60 * 1000; // 10 minutes
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Müşteri Yönetimi</h1>
                    <p className="text-gray-400">Yeni müşteri oluşturun ve yönetin.</p>
                </div>
            </div>

            {/* Create Customer Form */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Plus className="text-purple-400" size={20} /> Yeni Müşteri Ekle
                </h2>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Firma Adı</label>
                            <input
                                type="text"
                                required
                                value={createForm.company_name}
                                onChange={e => setCreateForm({ ...createForm, company_name: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500/50 outline-none"
                                placeholder="Örn: Ajans Amca"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Yetkili Kişi</label>
                            <input
                                type="text"
                                required
                                value={createForm.contact_name}
                                onChange={e => setCreateForm({ ...createForm, contact_name: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500/50 outline-none"
                                placeholder="Ad Soyad"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">E-posta</label>
                            <input
                                type="email"
                                required
                                value={createForm.email}
                                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500/50 outline-none"
                                placeholder="mail@site.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Şifre</label>
                            <input
                                type="text"
                                required
                                value={createForm.password}
                                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500/50 outline-none"
                                placeholder="Şifre"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-400 ml-1">Web Sitesi</label>
                            <input
                                type="text"
                                required
                                value={createForm.domain}
                                onChange={e => setCreateForm({ ...createForm, domain: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500/50 outline-none"
                                placeholder="www.site.com"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={18} />}
                            Oluştur
                        </button>
                    </div>
                </form>
                {error && (
                    <div className="mt-4 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>

            <div className="grid gap-4">
                {customers.map(c => {
                    const isOnline = isActive(c.last_active_at);
                    return (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-colors group"
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-white">{c.company_name}</h3>
                                    {c.is_suspended && (
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/20 flex items-center gap-1">
                                            <Ban size={10} /> Askıda
                                        </span>
                                    )}
                                    <div className={clsx(
                                        "px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5",
                                        isOnline
                                            ? "bg-green-500/20 text-green-400 border-green-500/20"
                                            : "bg-gray-500/20 text-gray-400 border-gray-500/20"
                                    )}>
                                        <div className={clsx("w-1.5 h-1.5 rounded-full", isOnline ? "bg-green-400 animate-pulse" : "bg-gray-400")} />
                                        {isOnline ? 'Aktif' : 'Pasif'}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 flex flex-wrap gap-4">
                                    <span>{c.contact_name}</span>
                                    <span className="text-gray-600">•</span>
                                    <span>{c.email}</span>
                                    <span className="text-gray-600">•</span>
                                    <a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                                        {c.domain}
                                    </a>
                                </div>
                                <div className="text-xs text-gray-500 font-mono mt-2 flex items-center gap-2">
                                    ID: <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300">{c.site_id}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => verifySite(c.id)}
                                    disabled={!!verifyingId}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
                                    title="Site Bağlantısını Doğrula"
                                >
                                    {verifyingId === c.id ? <Loader2 size={20} className="animate-spin" /> : <Globe size={20} />}
                                </button>
                                <button
                                    onClick={() => startEdit(c)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => handleSuspend(c.id, c.is_suspended || false)}
                                    className={clsx(
                                        "p-2 hover:bg-white/10 rounded-lg transition-colors",
                                        c.is_suspended ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-yellow-400"
                                    )}
                                    title={c.is_suspended ? "Askıyı Kaldır" : "Hesabı Askıya Al"}
                                >
                                    {c.is_suspended ? <CheckCircle size={20} /> : <Ban size={20} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    title="Sil"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}

                {isLoading && (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-purple-500" />
                        <p>Müşteriler yükleniyor...</p>
                    </div>
                )}

                {!isLoading && customers.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <Users2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Henüz kayıtlı müşteri yok.</p>
                    </div>
                )}
            </div>

            {/* EDIT MODAL */}
            <AnimatePresence>
                {editingCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingCustomer(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{editingCustomer.company_name}</h2>
                                    <p className="text-xs text-gray-400">Site ID: {editingCustomer.site_id}</p>
                                </div>
                                <button onClick={() => setEditingCustomer(null)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* TABS */}
                            <div className="flex border-b border-white/10 shrink-0">
                                <button
                                    onClick={() => setEditTab('details')}
                                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${editTab === 'details' ? 'bg-white/5 text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <UserIcon size={16} /> Müşteri Bilgileri
                                </button>
                                <button
                                    onClick={() => setEditTab('goals')}
                                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${editTab === 'goals' ? 'bg-white/5 text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <Target size={16} /> Hedef Ayarları
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                {editTab === 'details' ? (
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        {error && (
                                            <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Şirket Adı</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editForm.company_name}
                                                    onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Yetkili Kişi</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editForm.contact_name}
                                                    onChange={e => setEditForm({ ...editForm, contact_name: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm text-gray-400 mb-1">E-posta</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm text-gray-400 mb-1">Domain (Site Adresi)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editForm.domain}
                                                    onChange={e => setEditForm({ ...editForm, domain: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                                    placeholder="ornek.com"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm text-gray-400 mb-1">Yeni Şifre (Opsiyonel)</label>
                                                <input
                                                    type="password"
                                                    value={editForm.password}
                                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                                    placeholder="Değiştirmek için yazın"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setEditingCustomer(null)}
                                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                İptal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                                Güncelle
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* GOALS TAB */
                                    <div className="space-y-4">
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <h4 className="text-blue-400 font-bold text-sm">Uzaktan Hedef Yönetimi</h4>
                                                <p className="text-xs text-gray-300 mt-1">
                                                    Buradan eklediğiniz kurallar, müşterinin sitesindeki tracker scriptine otomatik iletilir.
                                                    Kod değişikliği gerekmez.
                                                </p>
                                            </div>
                                        </div>

                                        {editingCustomer.site_id ? (
                                            <div className="space-y-8">
                                                <GoalAnalytics siteId={editingCustomer.site_id} />
                                                <div className="w-full h-px bg-white/10" />
                                                <GoalManager siteId={editingCustomer.site_id} customerId={editingCustomer.id} />
                                            </div>
                                        ) : (
                                            <div className="text-red-400">Site ID bulunamadı.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
