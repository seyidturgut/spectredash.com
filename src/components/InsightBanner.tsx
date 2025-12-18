import React from 'react';
import { Sparkles } from 'lucide-react';

interface InsightBannerProps {
    insight: string;
}

export const InsightBanner: React.FC<InsightBannerProps> = ({ insight }) => {
    if (!insight) return null;

    return (
        <div className="mb-8 p-1 relative overflow-hidden rounded-2xl group max-w-full">
            {/* Gradient Border Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Inner Content */}
            <div className="relative bg-[#0F1115] rounded-xl p-5 md:p-6 flex items-start gap-4 shadow-lg">

                {/* Icon Circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-400 mb-1 flex items-center gap-2">
                        GÜNLÜK AI ÖZETİ
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">BETA</span>
                    </h3>
                    <p className="text-base md:text-lg text-gray-100 leading-relaxed font-medium break-words">
                        {insight}
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <div className="w-32 h-32 bg-blue-500 rounded-full blur-[60px]" />
                </div>
            </div>
        </div>
    );
};
