import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export type DateRangeOption = 'Bugün' | 'Dün' | 'Son 7 Gün' | 'Son 30 Gün';

interface DateRangePickerProps {
    selectedRange: DateRangeOption;
    onRangeChange: (range: DateRangeOption) => void;
}

const options: DateRangeOption[] = ['Bugün', 'Dün', 'Son 7 Gün', 'Son 30 Gün'];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ selectedRange, onRangeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 transition-all duration-200 min-w-[160px] justify-between group"
            >
                <div className="flex items-center space-x-2 text-gray-300 group-hover:text-white">
                    <Calendar size={16} className="text-purple-400" />
                    <span className="text-sm font-medium">{selectedRange}</span>
                </div>
                <ChevronDown size={14} className={clsx("text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-1 space-y-0.5">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onRangeChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left",
                                        selectedRange === option
                                            ? "bg-purple-500/20 text-white"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
