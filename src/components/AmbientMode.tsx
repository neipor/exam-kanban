import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { type ExamScheduleItem, type ExamStatus } from '../types';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';

interface AmbientModeProps {
  nextExam: ExamScheduleItem | null;
  timeUntilNext: number;
  formatTime: (ms: number) => string;
  currentTime: Date;
  currentStatus: ExamStatus;
  examSchedule: ExamScheduleItem[];
}

const AmbientMode: React.FC<AmbientModeProps> = ({
  nextExam,
  timeUntilNext,
  formatTime,
  currentTime,
  examSchedule,
}) => {
  const { t } = useTranslation();

  // 1. Define Theme (Blue for Standby/Break)
  const theme = useMemo(() => {
    if (!nextExam) {
        // All Finished State
        return {
            label: 'SYSTEM IDLE',
            textColor: 'text-gray-500',
            bgGradient: 'from-gray-900 to-black',
            badgeBorder: 'border-gray-700',
            badgeText: 'text-gray-500',
            barColor: 'bg-gray-700',
            orbColor: 'bg-gray-800/10'
        };
    }

    // Standby / Break Theme (Calm Blue)
    return {
        label: 'STANDBY', 
        textColor: 'text-blue-500', 
        bgGradient: 'from-blue-950/30 to-black',
        badgeBorder: 'border-blue-500/30',
        badgeText: 'text-blue-500',
        barColor: 'bg-blue-500',
        orbColor: 'bg-blue-600/10'
    };
  }, [nextExam]);

  // 2. Calculate Break Progress
  const progress = useMemo(() => {
    if (!nextExam) return 0;
    try {
      const sorted = [...examSchedule].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      const nextIndex = sorted.findIndex(e => e.id === nextExam.id);
      
      let startTimeOfBreak = currentTime.getTime(); 
      if (nextIndex > 0) {
        startTimeOfBreak = sorted[nextIndex - 1].endTime.getTime();
      } else {
        startTimeOfBreak = nextExam.startTime.getTime() - 3600000; 
      }

      const totalDuration = nextExam.startTime.getTime() - startTimeOfBreak;
      const elapsed = currentTime.getTime() - startTimeOfBreak;
      
      const p = (elapsed / totalDuration) * 100;
      return Math.min(Math.max(p, 0), 100);
    } catch (e) {
      return 0;
    }
  }, [nextExam, currentTime, examSchedule]);

  const timeString = formatTime(timeUntilNext);

  // Sort schedule for display
  const sortedSchedule = useMemo(() => 
    [...examSchedule].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
  [examSchedule]);

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex overflow-hidden font-['JetBrains_Mono'] selection:bg-white/20">
      
      {/* --- Background Layers --- */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          willChange: 'opacity'
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} pointer-events-none transition-colors duration-1000`} />

      {nextExam && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
                background: 'radial-gradient(circle, rgba(30, 58, 138, 0.4) 0%, transparent 70%)', // Simulated blur with gradient
                willChange: 'transform, opacity'
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] rounded-full pointer-events-none transition-colors duration-1000`}
          />
      )}

      {/* --- Main Content (Left/Center) --- */}
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 px-4 transition-all duration-500">
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[5vmin] md:text-5xl font-bold text-gray-300 tracking-tight font-['Outfit'] mb-4"
        >
          {nextExam ? nextExam.subject : t('timeline.all_finished')}
        </motion.h2>

        <div className="relative group w-full flex justify-center">
          <h1 
            className={`leading-none font-bold tabular-nums tracking-tighter transition-colors duration-300 ${theme.textColor} ${!nextExam ? 'text-[10vmin] tracking-normal uppercase' : 'text-[22vmin]'}`}
          >
            {nextExam ? timeString : "DONE"}
          </h1>
        </div>

        {nextExam && (
            <div className="mt-12 text-gray-500 font-mono text-sm md:text-base tracking-widest">
            {t('timeline.starts_at')}: <span className="text-gray-300">{nextExam.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        )}
      </div>

      {/* --- Sidebar (Right) --- */}
      <div className="hidden lg:flex flex-col w-80 h-full border-l border-white/10 bg-black/20 backdrop-blur-md z-20 p-6 overflow-y-auto custom-scrollbar">
         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Clock size={14} /> {t('timeline.history_list')}
         </h3>
         <div className="space-y-4">
            {sortedSchedule.map((item, _index) => {
               const isPast = item.endTime.getTime() <= currentTime.getTime();
               const isNext = nextExam?.id === item.id;
               
               return (
                  <div 
                    key={item.id}
                    className={`relative p-4 rounded-lg border transition-all duration-300 ${
                        isNext 
                            ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : isPast 
                                ? 'bg-white/5 border-white/5 opacity-50' 
                                : 'bg-transparent border-white/10 text-gray-400'
                    }`}
                  >
                     <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold ${isNext ? 'text-blue-400' : isPast ? 'text-gray-400' : 'text-gray-300'}`}>
                            {item.subject}
                        </span>
                        {isPast && <CheckCircle2 size={16} className="text-green-500/70" />}
                        {isNext && <ChevronRight size={16} className="text-blue-400 animate-pulse" />}
                        {!isPast && !isNext && <Circle size={16} className="text-gray-600" />}
                     </div>
                     <div className="flex justify-between text-xs font-mono opacity-70">
                        <span>{item.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        <span className="text-gray-600">-</span>
                        <span>{item.endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* --- Footer Progress --- */}
      <div className="fixed bottom-0 left-0 w-full h-[4px] bg-gray-900 z-30">
        <div 
          className={`h-full ${theme.barColor}`}
          style={{ 
              transform: `scaleX(${progress / 100})`, 
              transformOrigin: 'left',
              transition: 'transform 1s linear' 
          }}
        />
      </div>

    </div>
  );
};

export default AmbientMode;