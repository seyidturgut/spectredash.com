import type { TrackPayload, ApiResponse } from '../types';

/**
 * Simulates a backend API endpoint handler.
 * In a real Next.js app, this would be an API Route (pages/api/track.ts or app/api/track/route.ts).
 */
export const handleTrackRequest = async (payload: TrackPayload): Promise<ApiResponse> => {
    // 1. Simulate Network Delay (optimized for fast UI feel)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Validation
    if (!payload.site_id) {
        console.error("API Error: Missing site_id");
        return { status: 'error', message: 'Missing site_id' };
    }

    // 3. Log received data (Simulating Database Insert)
    console.log("--------------------------------------------------");
    console.log("📡 [API] Incoming Data Received:");
    console.table(payload);
    console.log("--------------------------------------------------");

    // 4. Return Success Response
    return {
        status: 'success',
        message: 'Veri başarıyla alındı ve işlendi.',
        data: payload
    };
};
