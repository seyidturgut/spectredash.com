import type { Visitor, Stats, TrafficData, DeviceData } from './types';

export const mockStats: Stats = {
    totalVisits: 12450,
    totalVisitsChange: 12,
    liveUserCount: 45,
    averageDuration: '2dk 15sn',
};

export const mockVisitors: Visitor[] = [
    { id: 1, status: 'active', url: '/panel/analiz', source: 'Google', device: 'Masaüstü', timestamp: 'Şimdi' },
    { id: 2, status: 'active', url: '/fiyatlandirma', source: 'Direkt', device: 'Mobil', timestamp: '2dk önce' },
    { id: 3, status: 'idle', url: '/blog/yeni-ozellikler', source: 'Twitter', device: 'Masaüstü', timestamp: '5dk önce' },
    { id: 4, status: 'active', url: '/iletisim', source: 'Google', device: 'Tablet', timestamp: '8dk önce' },
    { id: 5, status: 'active', url: '/urunler/saas-kit', source: 'Direkt', device: 'Masaüstü', timestamp: '12dk önce' },
    { id: 6, status: 'idle', url: '/hakkimizda', source: 'LinkedIn', device: 'Mobil', timestamp: '15dk önce' },
];

export const mockTrafficData: TrafficData[] = [
    { name: 'Pzt', visits: 4000 },
    { name: 'Sal', visits: 3000 },
    { name: 'Çar', visits: 2000 },
    { name: 'Per', visits: 2780 },
    { name: 'Cum', visits: 1890 },
    { name: 'Cmt', visits: 2390 },
    { name: 'Paz', visits: 3490 },
];

export const mockDeviceData: DeviceData[] = [
    { name: 'Masaüstü', value: 65, color: '#3b82f6' },
    { name: 'Mobil', value: 25, color: '#8b5cf6' },
    { name: 'Tablet', value: 10, color: '#06b6d4' },
];
