import React from 'react';
import { motion } from 'framer-motion';
import { X, Github, Star, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 size={24} className="text-blue-400" />
            {t('about.title')}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          
          <p className="text-gray-300 leading-relaxed">
            {t('about.desc')}
          </p>

          <div className="flex flex-col gap-2 items-center py-4 bg-white/5 rounded-xl border border-white/5">
             <img 
               src="https://github.com/neipor.png" 
               alt="Xinhe Hu" 
               className="w-16 h-16 rounded-full border-2 border-blue-500/30 mb-2"
             />
             <div className="font-bold text-white text-lg">Xinhe Hu</div>
             <div className="text-xs text-gray-500 font-mono tracking-wider">@neipor</div>
             <div className="text-[10px] text-gray-600 mt-1 px-2 py-0.5 border border-gray-700 rounded bg-black/20">
                {t('about.license')}
             </div>
          </div>

          <div className="space-y-3">
            <a 
              href="https://github.com/neipor/exam-kanban" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all active:scale-95"
            >
              <Github size={20} />
              {t('about.github')}
            </a>
            
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium animate-pulse">
               <Star size={16} fill="currentColor" />
               {t('about.star_request')}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default AboutModal;
