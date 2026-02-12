import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { type ExamScheduleItem } from '../types';

interface CollectionModeProps {
  currentExam: ExamScheduleItem;
}

const CollectionMode: React.FC<CollectionModeProps> = ({ currentExam }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-6">
        
        {/* Subject label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 md:mb-8"
        >
          <span className="text-sm md:text-base uppercase tracking-[0.3em] text-white/50 font-medium block mb-3">
            {t('timeline.subject')}
          </span>
          <span className="text-3xl md:text-4xl text-white font-semibold">
            {currentExam.subject}
          </span>
        </motion.div>

        {/* Main text - BIG AND BOLD */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-[18vmin] md:text-[180px] font-bold text-white tracking-tight leading-none mb-6"
        >
          {t('timeline.pens_down')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-white/70 font-medium tracking-wide"
        >
          {t('timeline.wait_for_collection')}
        </motion.p>
      </div>
    </div>
  );
};

export default CollectionMode;
