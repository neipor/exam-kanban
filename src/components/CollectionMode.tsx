import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { type ExamScheduleItem } from '../types';
import { AlertTriangle } from 'lucide-react';

interface CollectionModeProps {
  currentExam: ExamScheduleItem;
}

const CollectionMode: React.FC<CollectionModeProps> = ({ currentExam }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 h-screen w-screen bg-red-950 flex flex-col items-center justify-center overflow-hidden font-['JetBrains_Mono'] z-50">
      {/* Flashing Background Overlay */}
      <motion.div 
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'opacity' }}
        className="absolute inset-0 bg-red-600 pointer-events-none"
      />

      {/* Content */}
      <div className="z-10 flex flex-col items-center text-center max-w-[90vw] px-6 relative">
        
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ willChange: 'transform' }}
          className="mb-4 md:mb-8 text-red-500"
        >
           <AlertTriangle size={80} strokeWidth={1.5} className="w-[15vmin] h-[15vmin]" />
        </motion.div>

        <h2 className="text-[4vmin] md:text-3xl font-medium text-red-200 opacity-80 mb-2 md:mb-4 tracking-widest uppercase">
          {currentExam.subject}
        </h2>

        <div className="relative">
          <h1 
            className="text-[15vmin] md:text-9xl font-black text-white tracking-tighter uppercase leading-none"
            style={{ textShadow: '0 0 30px rgba(220,38,38,0.8)' }}
          >
            {t('timeline.pens_down')}
          </h1>
        </div>

        <p className="mt-4 md:mt-8 text-[3vmin] md:text-2xl text-red-100 font-bold tracking-wide bg-red-900/30 px-6 py-3 rounded-full border border-red-500/30">
           {t('timeline.wait_for_collection')}
        </p>

      </div>

      {/* Footer Stripe */}
      <div className="fixed bottom-0 w-full h-2 bg-red-500/50" />
      <div className="fixed top-0 w-full h-2 bg-red-500/50" />
    </div>
  );
};

export default CollectionMode;
