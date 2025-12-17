import { useState, useEffect, useRef } from 'react';
import { Map, Monitor, Smartphone, Info } from 'lucide-react';
import simpleheat from 'simpleheat';

interface HeatmapData {
    clicks?: Array<{ x: number; y: number; count: number; viewport_width: number; viewport_height: number }>;
    scrolls?: Array<{ depth: number; count: number }>;
    movements?: Array<{ x: number; y: number; count: number }>;
}

interface HeatmapViewerProps {
    siteId: string;
}

export function HeatmapViewer({ siteId }: HeatmapViewerProps) {
    const [urls, setUrls] = useState<{ url: string; title: string }[]>([]);
    const [selectedUrl, setSelectedUrl] = useState('');
    const [heatmapType, setHeatmapType] = useState<'click' | 'movement'>('click');
    const [deviceType, setDeviceType] = useState<'Desktop' | 'Mobile'>('Desktop');
    const [data, setData] = useState<HeatmapData>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeSize, setIframeSize] = useState({ width: 1280, height: 800 });

    useEffect(() => {
        fetchUrls();
    }, [siteId]);

    useEffect(() => {
        if (selectedUrl) {
            fetchHeatmapData();
        }
    }, [selectedUrl, heatmapType, deviceType]);

    useEffect(() => {
        if (!canvasRef.current || !data[heatmapType === 'click' ? 'clicks' : 'movements']) return;
        drawHeatmap();
    }, [data, iframeSize]);

    const fetchUrls = async () => {
        try {
            const res = await fetch(`/api/heatmap/urls.php?site_id=${siteId}`);
            const data = await res.json();
            setUrls(data.urls || []);
            if (data.urls && data.urls.length > 0) setSelectedUrl(data.urls[0].url);
        } catch (err) {
            console.error('Failed to fetch URLs:', err);
        }
    };

    const fetchHeatmapData = async () => {
        if (!selectedUrl) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/heatmap/stats.php?site_id=${siteId}&url=${encodeURIComponent(selectedUrl)}&type=${heatmapType}&device=${deviceType}`);
            const jsonData = await res.json();
            setData(jsonData);
        } catch (err) {
            console.error('Failed to fetch heatmap data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        const points = heatmapType === 'click' ? data.clicks : data.movements;
        if (!points || points.length === 0) return;

        // @ts-ignore
        const heat = simpleheat(canvas);
        const heatPoints = points.map(p => [p.x, p.y, p.count || 1] as [number, number, number]);

        heat.data(heatPoints);

        if (heatmapType === 'click') {
            // Cap max to a reasonable density so single clicks are visible but clusters burn
            // If we assume raw data (count=1), a cluster of 5 clicks = value 5. 
            // Setting max to 5 means 5 clicks = RED.
            heat.max(5);
            heat.radius(25, 15);
        } else {
            heat.max(10);
            heat.radius(15, 10);
        }

        heat.draw();
    };

    // Listen for resize messages from the tracker (PostMessage)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'SPECTRE_RESIZE' && event.data.height) {
                // Security check? Ideally check origin, but verify site_id match is enough contextually
                const height = event.data.height;
                setIframeSize(prev => ({ ...prev, height: height }));
                if (canvasRef.current) {
                    canvasRef.current.height = height;
                    requestAnimationFrame(drawHeatmap);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleIframeLoad = () => {
        // Fallback for same-origin or if tracker not yet active
        try {
            if (iframeRef.current?.contentWindow?.document?.body?.scrollHeight) {
                const height = iframeRef.current.contentWindow.document.body.scrollHeight;
                setIframeSize(prev => ({ ...prev, height: height || 800 }));
                if (canvasRef.current) {
                    canvasRef.current.height = height || 800;
                    requestAnimationFrame(drawHeatmap);
                }
            }
        } catch (e) {
            // Expected CORS block, waiting for postMessage
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header Controls */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4 max-w-2xl">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 mt-1">
                            <Map size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-white">Isı Haritası</h1>
                                <button
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="text-gray-400 hover:text-white transition-colors relative"
                                >
                                    <Info size={20} />
                                    {showInfo && (
                                        <div className="absolute left-full ml-2 top-0 w-64 p-3 bg-gray-900 border border-white/10 rounded-xl text-sm text-gray-300 shadow-xl z-50">
                                            Bu harita, sayfandaki hangi bölümlerin müşterilerini mıknatıs gibi çektiğini gösterir. Böylece en önemli mesajlarını nereye koyman gerektiğini hemen anlarsın.
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* PROMPT 1: Header Description */}
                            <p className="text-gray-300 mt-2 text-lg leading-relaxed">
                                Bu sayfadaki renkli harita, ziyaretçilerin sayfa üzerinde en çok nerelere baktığını ve tıkladığını gösterir.
                            </p>

                            {/* Mobile specific text */}
                            <div className="md:hidden mt-2 p-2 bg-white/5 rounded-lg text-sm text-orange-200 flex items-center gap-2">
                                <span className="text-xl">🔥</span>
                                Kırmızı yerler en çok tıklanan popüler alanlardır.
                            </div>

                            <div className="mt-4">
                                <select
                                    value={selectedUrl}
                                    onChange={(e) => setSelectedUrl(e.target.value)}
                                    className="bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                                >
                                    {urls.map(item => (
                                        <option key={item.url} value={item.url}>{item.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center bg-black/20 p-1 rounded-lg self-end">
                            <button
                                onClick={() => setDeviceType('Desktop')}
                                className={`p-2 rounded-md transition-colors ${deviceType === 'Desktop' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                title="Masaüstü Görünüm"
                            >
                                <Monitor size={20} />
                            </button>
                            <button
                                onClick={() => setDeviceType('Mobile')}
                                className={`p-2 rounded-md transition-colors ${deviceType === 'Mobile' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                title="Mobil Görünüm"
                            >
                                <Smartphone size={20} />
                            </button>
                        </div>

                        <div className="flex gap-2">
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

                {/* PROMPT 2: Legend */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-sm text-gray-200">
                            <strong>Kırmızı:</strong> Burası yanıyor! 🔥 Ziyaretçilerin en çok ilgilendiği alanlar.
                        </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                        <span className="text-sm text-gray-200">
                            <strong>Sarı:</strong> İlgi görüyor, ziyaretçiler buraya da göz atıyor. 👀
                        </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-sm text-gray-200">
                            <strong>Mavi:</strong> Sakin bölgeler, burası daha az dikkat çekiyor. ❄️
                        </span>
                    </div>
                </div>
            </div>

            {/* Heatmap Container */}
            <div className="flex-1 relative bg-white rounded-xl overflow-hidden shadow-2xl border border-white/10 mx-auto transition-all duration-500"
                style={{
                    width: deviceType === 'Desktop' ? '100%' : '375px',
                    maxWidth: deviceType === 'Desktop' ? '1280px' : '375px',
                    height: '800px'
                }}
            >
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                    <div className="relative" style={{ width: '100%', minHeight: '100%' }}>
                        <iframe
                            ref={iframeRef}
                            src={selectedUrl}
                            className="w-full border-none bg-white block"
                            style={{ height: iframeSize.height }}
                            onLoad={handleIframeLoad}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                        <canvas
                            ref={canvasRef}
                            width={deviceType === 'Desktop' ? 1280 : 375}
                            height={iframeSize.height}
                            className="absolute top-0 left-0 pointer-events-none mix-blend-multiply opacity-80"
                        />
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="text-white">Yükleniyor...</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PROMPT 4: Footer Action Text */}
            <div className="glass-panel p-4 rounded-xl text-center">
                <p className="text-gray-300 text-lg">
                    💡 Kırmızı alanlarda <strong>'Satın Al'</strong> butonun var mı? Eğer yoksa, önemli butonlarını bu sıcak bölgelere taşıyarak satışlarını artırabilirsin.
                </p>
            </div>
        </div>
    );
}
