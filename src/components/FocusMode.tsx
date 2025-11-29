import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { type ExamScheduleItem } from '../types';
import { useTranslation } from 'react-i18next';

interface FocusModeProps {
  currentExam: ExamScheduleItem | null;
  timeUntilEnd: number;
  formatTime: (ms: number) => string;
  currentTime: Date;
}

const FocusMode: React.FC<FocusModeProps> = ({
  currentExam,
  timeUntilEnd,
  formatTime,
  currentTime,
}) => {
  const { t } = useTranslation();

  const isDead = timeUntilEnd <= 0;

  // 1. Calculate Theme based on phases
  const theme = useMemo(() => {
    if (isDead) {
        return {
            phase: 'dead',
            textColor: 'text-gray-500', // Greyed out
            glowColor: 'shadow-none',
            bgGradient: 'from-gray-900 to-black', // Cold, dead slate
            orbColor: 'opacity-0', // No orb
            borderColor: 'border-gray-700',
        };
    }

    const minutesLeft = timeUntilEnd / 60000;
    
    if (minutesLeft <= 1) {
      return {
        phase: 'final', // < 1 min: Final Countdown (Deep Crimson)
        textColor: 'text-red-500', 
        textGlow: 'drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]', // Subtle white glow
        glowColor: 'shadow-red-900/50',
        bgGradient: 'from-red-950 via-black to-black',
        orbColor: 'bg-red-600/20',
        borderColor: 'border-red-500/50',
        pulseSpeed: 0.8 // Fast Pulse
      };
    } else if (minutesLeft <= 5) {
      return {
        phase: 'critical', // < 5 min: Crimson Red (Adrenaline)
        textColor: 'text-red-400',
        textGlow: 'drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]',
        glowColor: 'shadow-red-900/40',
        bgGradient: 'from-red-950/40 via-black to-black',
        orbColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        pulseSpeed: 0 
      };
    } else if (minutesLeft <= 15) {
      return {
        phase: 'warning', // < 15 min: Amber (Alert)
        textColor: 'text-amber-400',
        textGlow: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]',
        glowColor: 'shadow-amber-900/30',
        bgGradient: 'from-amber-950/30 via-black to-black',
        orbColor: 'bg-amber-500/5',
        borderColor: 'border-amber-500/20',
        pulseSpeed: 0
      };
    } else {
      return {
        phase: 'flow', // Normal: Ice Blue / White (Rationality)
        textColor: 'text-cyan-50', // Almost white, slight cool tint
        textGlow: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]', // Cyan-400 glow
        glowColor: 'shadow-cyan-500/20',
        bgGradient: 'from-cyan-950/30 via-black to-black',
        orbColor: 'bg-cyan-500/5',
        borderColor: 'border-cyan-500/10',
        pulseSpeed: 8 // Deep, slow breath
      };
    }
  }, [timeUntilEnd, isDead]);

  // Progress stays at 100% if dead
  const progress = useMemo(() => {
    if (!currentExam) return 0;
    if (isDead) return 100;
    const totalDuration = currentExam.endTime.getTime() - currentExam.startTime.getTime();
    const elapsed = currentTime.getTime() - currentExam.startTime.getTime();
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }, [currentExam, currentTime, isDead]);

  if (!currentExam) return null;

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex flex-col items-center justify-center overflow-hidden font-['JetBrains_Mono'] selection:bg-white/20">
      
      {/* --- Background Layers --- */}
      
      {/* 1. Dot Matrix (Only visible when alive) */}
      {!isDead && (
        <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
            }}
        />
      )}

      {/* 2. Mood Gradient */}
      <motion.div 
        animate={{ opacity: isDead ? 1 : [0.5, 0.7, 0.5] }}
        transition={{ duration: isDead ? 0 : 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'opacity' }}
        className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} pointer-events-none transition-all duration-1000`}
      />

      {/* 3. Central Orb (Only when alive) */}
      {!isDead && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} // Lower opacity since we use solid currentColor
            transition={{ duration: theme.pulseSpeed || 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
                background: 'radial-gradient(closest-side, currentColor, transparent)',
                willChange: 'transform, opacity'
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] rounded-full pointer-events-none transition-colors duration-1000 ${theme.textColor}`} 
          />
      )}
      
      {/* 4. Dead Overlay (Gray wash) */}
      {isDead && (
          <div className="absolute inset-0 bg-black/80 backdrop-grayscale z-0 pointer-events-none" />
      )}

      {/* --- Main Content --- */}
      <div className="z-10 flex flex-col items-center text-center w-full max-w-[90vw] px-4 relative">
        
        {/* Subject Title */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: isDead ? 0.3 : 1 }}
          className="text-[5vmin] md:text-5xl font-bold text-white tracking-tight font-['Outfit'] mb-4 md:mb-8 transition-opacity duration-500"
        >
          {currentExam.subject}
        </motion.h2>

        {/* THE TIMER or STATUS */}
        <div className="relative group w-full flex justify-center">
          <motion.h1 
            className={`leading-none font-bold tabular-nums tracking-tighter transition-all duration-300 ${theme.textColor} ${theme.textGlow} ${isDead ? 'text-[10vmin] tracking-normal uppercase' : 'text-[22vmin]'}`}
            // Heartbeat effect for final minute (only if alive)
            animate={!isDead && theme.phase === 'final' ? { opacity: [0.9, 1, 0.9] } : { opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {isDead ? t('timeline.exam_finished_status') : formatTime(timeUntilEnd)}
          </motion.h1>
        </div>

        {/* End Time Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isDead ? 0.2 : 0.6 }}
          className="mt-12 text-gray-400 font-mono text-lg tracking-widest"
        >
          {t('timeline.ends_at')} <span className="text-white">{currentExam.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </motion.div>

      </div>

      {/* --- Footer Progress --- */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gray-900/50">
        <motion.div 
          className={`h-full ${isDead ? 'bg-gray-600' : 'bg-white'} shadow-[0_0_10px_currentColor]`}
          style={{ 
              transform: `scaleX(${progress / 100})`, 
              transformOrigin: 'left',
              willChange: 'transform'
          }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

    </div>
  );
};

export default FocusMode;