import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Settings, PlayCircle, ArrowRight, Info } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import AboutModal from '../components/AboutModal';

const WelcomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeSchedule } = useSchedule();
  const [showAbout, setShowAbout] = React.useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const nextExamDisplay = useMemo(() => {
    if (!activeSchedule || activeSchedule.length === 0) return t('timeline.no_active_exam');
    try {
      const now = new Date();
      const upcoming = activeSchedule
        .filter(e => {
           const end = e.endTime instanceof Date ? e.endTime : new Date(e.endTime);
           return end.getTime() > now.getTime();
        })
        .sort((a, b) => {
           const startA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
           const startB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
           return startA.getTime() - startB.getTime();
        })[0];
      
      if (upcoming) {
        return `${t('timeline.next_subject')}: ${upcoming.subject}`;
      }
      return t('timeline.all_finished');
    } catch (err) {
      return "Error loading data";
    }
  }, [activeSchedule, t]);

  const cards = [
    {
      title: t('welcome.timeline'),
      subtitle: nextExamDisplay,
      icon: Clock,
      onClick: () => navigate('/timeline'),
      accent: 'blue',
      size: 'large'
    },
    {
      title: t('welcome.import'),
      subtitle: t('import.desc'),
      icon: Settings,
      onClick: () => navigate('/import'),
      accent: 'slate',
      size: 'small'
    },
    {
      title: t('welcome.example'),
      subtitle: 'Playground Mode',
      icon: PlayCircle,
      onClick: () => navigate('/example'),
      accent: 'slate',
      size: 'small'
    }
  ];

  return (
    <div className="fixed inset-0 min-h-screen w-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#050505] to-black pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-4">
            {t('welcome.title')}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/10" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-medium">
              Exam Kanban System
            </span>
            <div className="h-px w-12 bg-white/10" />
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Card - Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate('/timeline')}
            className="md:col-span-1 md:row-span-2 group cursor-pointer"
          >
            <div className="h-full min-h-[320px] bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 flex flex-col justify-between hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Clock size={24} strokeWidth={1.5} />
                </div>
                <ArrowRight size={20} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-white mb-2">{t('welcome.timeline')}</h3>
                <p className="text-sm text-white/40">{nextExamDisplay}</p>
              </div>
            </div>
          </motion.div>

          {/* Secondary Cards */}
          {cards.slice(1).map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onClick={card.onClick}
              className="group cursor-pointer"
            >
              <div className="h-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 flex items-center gap-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
                <div className="p-3 rounded-xl bg-white/[0.04] text-white/60 group-hover:text-white/80 transition-colors">
                  <card.icon size={22} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-white/40">{card.subtitle}</p>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-between items-center mt-16 pt-8 border-t border-white/[0.06]"
        >
          <div className="flex items-center gap-6 text-[11px] text-white/30 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </span>
            <span>{new Date().getFullYear()}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
            >
              <Info size={14} />
              About
            </button>
            <button 
              onClick={toggleLanguage}
              className="text-[11px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
            >
              {i18n.language === 'zh' ? 'EN / 中文' : 'English'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage;
