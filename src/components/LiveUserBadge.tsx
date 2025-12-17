import { Radio } from 'lucide-react';
// motion removed (frame-motion dependency not needed)

interface LiveUserBadgeProps {
    count: number;
}

export const LiveUserBadge: React.FC<LiveUserBadgeProps> = ({ count }) => {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-sm">
            <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <div className="flex items-center gap-1.5">
                <Radio size={14} className="text-green-500" />
                <span className="text-sm font-bold text-green-400 tabular-nums">
                    {count}
                </span>
                <span className="hidden sm:inline text-xs text-green-500/80 font-medium">
                    Canlı
                </span>
            </div>
        </div>
    );
};
