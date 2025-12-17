import { useState, useEffect, useRef } from 'react';
import { Map, Info, Trash2, Camera, RefreshCw } from 'lucide-react';
import simpleheat from 'simpleheat';

interface HeatmapPage {
    id: number;
    url: string;
    device: 'Desktop' | 'Mobile';
    screenshot_path: string;
    created_at: string;
}

interface HeatmapViewerProps {
    siteId: string;
}

export function HeatmapViewer({ siteId }: HeatmapViewerProps) {
    const [pages, setPages] = useState<HeatmapPage[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
    const [newPageUrl, setNewPageUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [heatmapType, setHeatmapType] = useState<'click' | 'movement'>('click');
    const [data, setData] = useState<{ clicks?: any[], movements?: any[] }>({});
    const [isLoading, setIsLoading] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Fetch Pages on Mount
    useEffect(() => {
        fetchPages();
    }, [siteId]);

    // Fetch Data when Page Selected
    useEffect(() => {
        if (selectedPageId) {
            const page = pages.find(p => p.id === Number(selectedPageId));
            if (page) {
                fetchHeatmapData(page.url);
            }
        }
    }, [selectedPageId, heatmapType]);

    // Draw when Data Available
    useEffect(() => {
        if (!canvasRef.current || !data[heatmapType === 'click' ? 'clicks' : 'movements']) return;
        drawHeatmap();
    }, [data, selectedPageId]); // Re-draw if page changes (image loads)

    const fetchPages = async () => {
        try {
            const res = await fetch(`/api/heatmap/pages.php?action=list&site_id=${siteId}`);
            const json = await res.json();
            if (json.pages) {
                setPages(json.pages);
                if (json.pages.length > 0 && !selectedPageId) {
                    setSelectedPageId(json.pages[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch pages', err);
        }
    };

    const handleAddPage = async () => {
        if (!newPageUrl) return;
        setIsAdding(true);
        try {
            const res = await fetch(`/api/heatmap/pages.php?action=add&site_id=${siteId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newPageUrl, device: 'Desktop' }) // Default to desktop for now
            });
            const json = await res.json();
            if (json.page) {
                setPages(prev => [json.page, ...prev]);
                setSelectedPageId(json.page.id);
                setNewPageUrl('');
            } else {
                alert('Hata: ' + (json.error || 'Ekran görüntüsü alınamadı.'));
            }
        } catch (err) {
            alert('Sunucu hatası.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeletePage = async (id: number) => {
        if (!confirm('Bu sayfayı ve görüntüsünü silmek istediğine emin misin?')) return;
        try {
            await fetch(`/api/heatmap/pages.php?action=delete&id=${id}&site_id=${siteId}`, { method: 'DELETE' });
            setPages(prev => prev.filter(p => p.id !== id));
            if (selectedPageId === id) setSelectedPageId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHeatmapData = async (url: string) => {
        setIsLoading(true);
        try {
            // Fetch ALL data for this URL, regardless of "device" in snapshot, 
            // but in future we might want to filter by device too.
            const res = await fetch(`/api/heatmap/stats.php?site_id=${siteId}&url=${encodeURIComponent(url)}&type=${heatmapType}`);
            const jsonData = await res.json();
            setData(jsonData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Ensure canvas matches image size (1280x800 typically from API)
        // Ideally we read naturalWidth from image, but let's assume standard for now or wait for load
        // Actually, best way is to set canvas size to parent container which is the image size

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        const points = heatmapType === 'click' ? data.clicks : data.movements;
        if (!points || points.length === 0) return;

        // @ts-ignore
        const heat = simpleheat(canvas);

        // Data points: [x, y, count]
        // Important: Screenshot is usually 1280px wide. 
        // We map recorded clicks (absolute) to this 1280px canvas.
        const heatPoints = points.map((p: any) => [p.x, p.y, p.count || 1] as [number, number, number]);

        heat.data(heatPoints);

        if (heatmapType === 'click') {
            heat.max(5);
            heat.radius(25, 15);
        } else {
            heat.max(10);
            heat.radius(15, 10);
        }

        heat.draw();
    };

    const selectedPage = pages.find(p => p.id === Number(selectedPageId));

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header / Controls */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4 max-w-2xl">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 mt-1">
                            <Map size={28} />
                        </div>
                        <div className="space-y-4 w-full">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Snapshot Heatmap</h1>
                                <p className="text-gray-400 text-sm">Sayfa ekleyin, sistem fotoğrafını çeksin, siz analizi görün.</p>
                            </div>

                            {/* Page Selection Row */}
                            <div className="flex gap-2 items-center w-full">
                                {pages.length > 0 ? (
                                    <div className="flex-1 max-w-md">
                                        <select
                                            value={selectedPageId || ''}
                                            onChange={(e) => setSelectedPageId(Number(e.target.value))}
                                            className="bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                                        >
                                            {pages.map(p => (
                                                <option key={p.id} value={p.id}>{p.url} ({p.device}) - {new Date(p.created_at).toLocaleDateString()}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="text-yellow-400 text-sm flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-lg">
                                        <Info size={16} />
                                        Henüz hiç sayfa eklemediniz. Aşağıdan ekleyin.
                                    </div>
                                )}

                                {selectedPageId && (
                                    <button
                                        onClick={() => handleDeletePage(selectedPageId)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Sayfayı Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Add Page Form */}
                            <div className="flex gap-2 max-w-md">
                                <input
                                    type="url"
                                    placeholder="https://site.com/sayfa"
                                    value={newPageUrl}
                                    onChange={(e) => setNewPageUrl(e.target.value)}
                                    className="flex-1 bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                                />
                                <button
                                    onClick={handleAddPage}
                                    disabled={isAdding || !newPageUrl}
                                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isAdding ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}
                                    {isAdding ? 'Çekiliyor...' : 'Ekle & Çek'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Heatmap Type Toggles */}
                    <div className="flex gap-2 self-end">
                        <button
                            onClick={() => setHeatmapType('click')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${heatmapType === 'click' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Tıklamalar
                        </button>
                        <button
                            onClick={() => setHeatmapType('movement')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${heatmapType === 'movement' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Hareketler
                        </button>
                    </div>
                </div>
            </div>

            {/* Viewer Display */}
            <div className="flex-1 relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 mx-auto transition-all duration-500 w-full max-w-[1280px]">
                {selectedPage ? (
                    <div className="relative w-full h-[800px] overflow-y-auto custom-scrollbar">
                        <div className="relative">
                            {/* Snapshot Image */}
                            <img
                                src={selectedPage.screenshot_path}
                                alt="Page Snapshot"
                                className="w-[1280px] block"
                                onLoad={() => setTimeout(drawHeatmap, 100)} // Redraw when image loads to ensure sizing
                            />

                            {/* Heatmap Overlay */}
                            <canvas
                                ref={canvasRef}
                                width={1280} // Fixed to matches screenshot width used by backend API
                                height={800} // Dynamic based on image? For now 800 crop
                                className="absolute top-0 left-0 pointer-events-none mix-blend-multiply opacity-80"
                            />

                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div className="text-white flex flex-col items-center gap-2">
                                        <RefreshCw size={32} className="animate-spin text-orange-500" />
                                        <span>Veriler işleniyor...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
                        <Camera size={48} className="opacity-20" />
                        <p>Analiz etmek için yukarıdan bir sayfa ekleyin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
