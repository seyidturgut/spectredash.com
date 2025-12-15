import { motion } from 'framer-motion';

export const BackgroundOrbs = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Orb 1: Purple - Top Left */}
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[120px]"
            />

            {/* Orb 2: Blue - Bottom Right */}
            <motion.div
                animate={{
                    x: [0, -30, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[120px]"
            />

            {/* Orb 3: Accent - Center (Subtle) */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [0.8, 1, 0.8]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-indigo-900/10 rounded-full blur-[100px]"
            />
        </div>
    );
};
