import React from 'react';
import { motion } from 'framer-motion';
import { X, Github, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-medium text-white">{t('about.title')}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-white/60 leading-relaxed">
            {t('about.desc')}
          </p>

          <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-lg font-medium text-white/80">
              XH
            </div>
            <div>
              <div className="font-medium text-white">Xinhe Hu</div>
              <div className="text-xs text-white/40 font-mono">@neipor</div>
            </div>
          </div>

          <div className="space-y-3">
            <a 
              href="https://github.com/neipor/exam-kanban" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-medium text-white transition-colors"
            >
              <Github size={16} />
              {t('about.github')}
            </a>
            
            <div className="flex items-center justify-center gap-2 text-xs text-white/30">
              <Star size={12} />
              {t('about.star_request')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06]">
          <div className="text-[10px] text-white/30 text-center font-mono">
            {t('about.license')}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutModal;
