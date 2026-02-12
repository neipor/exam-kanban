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

  // Sophisticated color system
  const theme = useMemo(() => {
    if (isDead) {
      return {
        textColor: 'text-white/40',
        accentColor: 'bg-white/20',
        status: 'finished',
      };
    }

    const minutesLeft = timeUntilEnd / 60000;
    
    if (minutesLeft <= 5) {
      return {
        textColor: 'text-rose-200',
        accentColor: 'bg-rose-500/30',
        status: 'final',
      };
    } else if (minutesLeft <= 15) {
      return {
        textColor: 'text-amber-200',
        accentColor: 'bg-amber-500/20',
        status: 'warning',
      };
    } else {
      return {
        textColor: 'text-slate-200',
        accentColor: 'bg-blue-500/20',
        status: 'normal',
      };
    }
  }, [timeUntilEnd, isDead]);

  const progress = useMemo(() => {
    if (!currentExam) return 0;
    if (isDead) return 100;
    const totalDuration = currentExam.endTime.getTime() - currentExam.startTime.getTime();
    const elapsed = currentTime.getTime() - currentExam.startTime.getTime();
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }, [currentExam, currentTime, isDead]);

  if (!currentExam) return null;

    return (
    <div className="fixed inset-0 h-screen w-screen bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      
      {/* Ambient glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000 ${theme.accentColor}`} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl px-4">
        
        {/* Subject - clear and readable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 md:mb-6"
        >
          <span className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/50 font-medium mb-2 block">
            {t('timeline.subject')}
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
            {currentExam.subject}
          </h2>
        </motion.div>

        {/* Timer - main focus - BIGGER AND BOLDER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative"
        >
          <h1 className={`text-[22vmin] md:text-[200px] font-bold tabular-nums tracking-tighter leading-none ${theme.textColor} transition-colors duration-700`}>
            {isDead ? (
              <span className="text-5xl md:text-7xl font-bold tracking-wide uppercase">{t('timeline.exam_finished_status')}</span>
            ) : (
              formatTime(timeUntilEnd)
            )}
          </h1>
        </motion.div>

        {/* End time - clear detail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 md:mt-8"
        >
          <span className="text-base md:text-lg text-white/50 font-mono tracking-wider">
            {t('timeline.ends_at')} {' '}
            <span className="text-white font-medium">
              {currentExam.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </span>
        </motion.div>
      </div>

      {/* Bottom progress bar - thicker */}
      <div className="fixed bottom-0 left-0 w-full h-[4px] bg-white/10">
        <motion.div 
          className={`h-full ${isDead ? 'bg-white/40' : 'bg-white'}`}
          style={{ 
            width: `${progress}%`,
          }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default FocusMode;
