export interface Visitor {
    id: number;
    url: string;
    source: string;
    device: string;
    timestamp: string;
    status: 'active' | 'idle';
}

export interface Stats {
    totalVisits: number;
    totalVisitsChange: number;
    liveUserCount: number;
    averageDuration: string;
}

export interface TrafficData {
    name: string;
    visits: number;
}

export interface DeviceData {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

export interface TrackPayload {
    site_id: string;
    url: string;
    referrer: string;
    device: string;
}

export interface ApiResponse {
    status: 'success' | 'error';
    message: string;
    data?: any;
}

export interface User {
    id: number;
    email: string;
    role: 'admin' | 'client';
    company_name?: string;
    contact_name?: string;
    site_id?: string;
}
