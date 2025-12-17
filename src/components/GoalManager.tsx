import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target, Hash, MousePointer, Link2, Type, Loader2 } from 'lucide-react';

interface GoalDefinition {
    id: number;
    goal_name: string;
    selector_type: 'css_class' | 'css_id' | 'text_contains' | 'href_contains';
    selector_value: string;
    is_active: string | number; // API might return "1" or 1
}

interface GoalManagerProps {
    siteId: string;
    customerId: number;
}

export const GoalManager = ({ siteId, customerId }: GoalManagerProps) => {
    const [goals, setGoals] = useState<GoalDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Goal Form
    const [newGoal, setNewGoal] = useState({
        name: '',
        type: 'css_class' as const,
        value: '',
        default_value: 0
    });

    const [visualUrl, setVisualUrl] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);

    useEffect(() => {
        fetchGoals();
        // Check for picker callback
        const params = new URLSearchParams(window.location.search);
        const pickedSelector = params.get('new_selector');
        const pickedType = params.get('new_type');
        const pickedText = params.get('new_text');

        if (pickedSelector) {
            setNewGoal(prev => ({
                ...prev,
                type: (pickedType as any) || 'css_class',
                value: pickedSelector,
                name: pickedText ? `Tıklama: ${pickedText}` : 'Yeni Hedef'
            }));
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [siteId]);

    const fetchGoals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/goals/definitions?site_id=${siteId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setGoals(data);
            }
        } catch (err) {
            console.error('Failed to fetch goals', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.name || !newGoal.value) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/goals/definitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    site_id: siteId,
                    ...newGoal
                })
            });

            if (res.ok) {
                await fetchGoals();
                setNewGoal({ name: '', type: 'css_class', value: '', default_value: 0 });
            } else {
                alert('Hedef oluşturulamadı');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kuralı silmek istediğinize emin misiniz?')) return;

        try {
            await fetch(`/api/goals/definitions?id=${id}`, { method: 'DELETE' });
            setGoals(prev => prev.filter(g => g.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const startVisualPicker = () => {
        if (!visualUrl) {
            alert('Lütfen hedef sitenin URL adresini girin');
            return;
        }
        // Append param
        const urlObj = new URL(visualUrl.startsWith('http') ? visualUrl : `https://${visualUrl}`);
        urlObj.searchParams.set('spectre_mode', 'picker');

        // Pass Return URL with Customer ID to re-open modal
        const returnUrl = new URL(window.location.href);
        returnUrl.searchParams.set('edit_customer_id', customerId.toString());
        urlObj.searchParams.set('return_url', returnUrl.toString());

        window.open(urlObj.toString(), '_blank');
        setShowUrlInput(false);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'css_id': return <Hash size={14} className="text-blue-400" />;
            case 'css_class': return <Target size={14} className="text-purple-400" />;
            case 'href_contains': return <Link2 size={14} className="text-green-400" />;
            case 'text_contains': return <Type size={14} className="text-orange-400" />;
            default: return <MousePointer size={14} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'css_id': return 'Element ID';
            case 'css_class': return 'CSS Class';
            case 'href_contains': return 'Link İçeriği';
            case 'text_contains': return 'Metin İçeriği';
            default: return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="text-purple-400" />
                        Hedef Kuralları (Goals)
                    </h3>
                    <p className="text-sm text-gray-400">
                        Sitedeki tıklamaları otomatik hedefe dönüştürün.
                    </p>
                </div>
                <button
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-sm border border-blue-500/30 transition-colors"
                >
                    <MousePointer size={16} />
                    Görsel Seçici
                </button>
            </div>

            {/* Visual Picker URL Input */}
            <AnimatePresence>
                {showUrlInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex gap-2 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl mb-4">
                            <input
                                type="url"
                                placeholder="Site adresi (örn: https://mysite.com)"
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                value={visualUrl}
                                onChange={e => setVisualUrl(e.target.value)}
                            />
                            <button
                                onClick={startVisualPicker}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500"
                            >
                                Git ve Seç
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-end gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Hedef Adı</label>
                        <input
                            type="text"
                            required
                            placeholder="Örn: WhatsApp Tıkla"
                            value={newGoal.name}
                            onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                    </div>

                    <div className="w-full md:w-32 space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Değer (TL)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={newGoal.default_value}
                            onChange={e => setNewGoal({ ...newGoal, default_value: parseFloat(e.target.value) })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full md:w-48 space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Eşleşme Tipi</label>
                        <select
                            value={newGoal.type}
                            onChange={e => setNewGoal({ ...newGoal, type: e.target.value as any })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="css_class">CSS Class (Sınıf)</option>
                            <option value="css_id">Element ID</option>
                            <option value="href_contains">Link (Href) İçerir</option>
                            <option value="text_contains">Yazı İçerir</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Değer / Seçici</label>
                        <input
                            type="text"
                            required
                            placeholder='Örn: btn-success veya wa.me'
                            value={newGoal.value}
                            onChange={e => setNewGoal({ ...newGoal, value: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none font-mono"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Kuralı Kaydet
                </button>
            </form>

            {/* List */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                        <Loader2 size={24} className="mx-auto animate-spin mb-2" />
                        Yükleniyor...
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                        Henüz tanımlı kural yok.
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {goals.map(goal => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/5">
                                        {getTypeIcon(goal.selector_type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-white font-medium text-sm">{goal.goal_name}</h4>
                                            {/* Show Value Badge */}
                                            {/* @ts-ignore */}
                                            {goal.default_value > 0 && (
                                                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                                                    {/* @ts-ignore */}
                                                    ₺{goal.default_value}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                {getTypeLabel(goal.selector_type)}
                                            </span>
                                            <span className="text-gray-600">match</span>
                                            <code className="text-purple-300 font-mono bg-purple-500/10 px-1.5 py-0.5 rounded">
                                                {goal.selector_value}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(goal.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
