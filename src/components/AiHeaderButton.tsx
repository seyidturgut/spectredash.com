import { Sparkles } from 'lucide-react';

interface AiHeaderButtonProps {
    onClick: () => void;
    isLoading?: boolean;
}

export function AiHeaderButton({ onClick, isLoading }: AiHeaderButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="group relative flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full overflow-hidden transition-all hover:bg-white/5 active:scale-95"
        >
            {/* Animated Stroke/Border Effect */}
            <span className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent bg-[length:200%_100%] animate-[border-rotate_3s_linear_infinite]"
                style={{
                    maskImage: 'linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)',
                    maskClip: 'content-box, border-box',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor'
                }}
            />

            {/* Inner Content */}
            <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Sparkles size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                )}
                <span>Günün Özeti</span>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
        </button>
    );
}

// Add these styles to your global CSS or index.css if not present
// @keyframes border-rotate {
//   0% { background-position: 0% 50%; }
//   100% { background-position: 200% 50%; }
// }
