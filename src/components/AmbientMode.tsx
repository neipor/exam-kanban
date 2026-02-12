import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { type ExamScheduleItem } from '../types';
import { useTranslation } from 'react-i18next';

interface AmbientModeProps {
  nextExam: ExamScheduleItem | null;
  timeUntilNext: number;
  formatTime: (ms: number) => string;
  currentTime: Date;
}

const AmbientMode: React.FC<AmbientModeProps> = ({
  nextExam,
  timeUntilNext,
  formatTime,
}) => {
  const { t } = useTranslation();
  const isFinished = !nextExam;

  const progress = useMemo(() => {
    if (!nextExam) return 0;
    const now = Date.now();
    const start = nextExam.startTime.getTime();
    const breakStart = start - 60 * 60 * 1000;
    if (now < breakStart) return 0;
    const p = ((now - breakStart) / (start - breakStart)) * 100;
    return Math.min(Math.max(p, 0), 100);
  }, [nextExam]);

  if (isFinished) {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-[#050505] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="text-sm md:text-base uppercase tracking-[0.3em] text-white/40 font-medium block mb-6">
            All Complete
          </span>
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
            {t('timeline.all_finished')}
          </h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-4">
        
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-base uppercase tracking-[0.3em] text-white/50 font-medium block mb-4"
        >
          {t('timeline.next_subject')}
        </motion.span>

        {/* Subject name */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6"
        >
          {nextExam.subject}
        </motion.h2>

        {/* Countdown - BIG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative"
        >
          <h1 className="text-[18vmin] md:text-[160px] font-bold text-white tabular-nums tracking-tighter leading-none">
            {formatTime(timeUntilNext)}
          </h1>
        </motion.div>

        {/* Start time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6"
        >
          <span className="text-lg md:text-xl text-white/50 font-mono tracking-wider">
            {t('timeline.starts_at')} {' '}
            <span className="text-white font-medium">
              {nextExam.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </span>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 w-full h-[4px] bg-white/10">
        <motion.div 
          className="h-full bg-blue-400"
          style={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default AmbientMode;
