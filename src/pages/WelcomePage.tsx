import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';
import { Clock, Settings, PlayCircle, ArrowRight } from 'lucide-react'; // Reverted to safe icons
import { useSchedule } from '../context/ScheduleContext';

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Faster sequence
      delayChildren: 0.1,    // Less initial wait
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(15px)', scale: 0.98 },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    scale: 1,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
  },
};

const lineVariants: Variants = {
  hidden: { width: 0, opacity: 0 },
  visible: { 
    width: 48, 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" } // Faster expansion
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: 'blur(0px)',
    // "Fast start, slow settle" spring physics
    transition: { type: 'spring', stiffness: 220, damping: 25, mass: 0.8 } 
  },
};

// --- Components ---

const BentoCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  onClick, 
  className = "",
  accentColor = "text-blue-400",
}: { 
  title: string; 
  subtitle?: string; 
  icon: any; 
  onClick: () => void; 
  className?: string;
  accentColor?: string;
}) => (
  <motion.div
    variants={cardVariants}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative flex flex-col justify-between p-8 rounded-3xl cursor-pointer transition-all duration-300 group overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/40 hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)] ${className}`}
  >
    {/* Hover Highlight Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

    <div className="flex justify-between items-start z-10">
      <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 text-white transition-colors group-hover:bg-white/10 ${accentColor}`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-2 -mt-2">
        <ArrowRight className="text-white/50" />
      </div>
    </div>

    <div className="z-10 mt-8">
      <h3 className="text-2xl font-bold text-white/90 mb-1 tracking-tight group-hover:text-white transition-colors">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 font-light tracking-wide group-hover:text-gray-300 transition-colors">{subtitle}</p>}
    </div>
  </motion.div>
);

const WelcomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeSchedule } = useSchedule();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  // Quick stat for the Timeline card (Safe Version)
  const nextExamDisplay = useMemo(() => {
    if (!activeSchedule || activeSchedule.length === 0) return t('timeline.no_active_exam');
    try {
      const now = new Date();
      const upcoming = activeSchedule
        .filter(e => {
           // Ensure endTime is a Date object before calling getTime
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
      console.error("Error processing schedule dates:", err);
      return "Error loading data";
    }
  }, [activeSchedule, t]);

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex flex-col items-center justify-center p-6 overflow-hidden font-['Outfit'] text-white selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* 1. Background: Breathing Dot Matrix */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* 2. Ambient Spotlight (Center) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" 
      />
      
      {/* 3. Vignette Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,black_100%)] pointer-events-none" />

      {/* Main Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-5xl flex flex-col gap-12"
      >
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.h1 
            variants={titleVariants}
            className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 drop-shadow-sm"
          >
            {t('welcome.title')}
          </motion.h1>
          <motion.div className="flex items-center justify-center gap-4">
             <motion.div variants={lineVariants} className="h-[1px] bg-gradient-to-r from-transparent to-gray-600" />
             <motion.p 
               variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1 } } }}
               className="text-sm md:text-base font-medium text-gray-400 tracking-[0.4em] uppercase"
             >
               EXAM KANBAN SYSTEM
             </motion.p>
             <motion.div variants={lineVariants} className="h-[1px] bg-gradient-to-l from-transparent to-gray-600" />
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[400px]">
          
          {/* 1. Timeline: Hero Card (Span 2 cols) */}
          <BentoCard 
            title={t('welcome.timeline')}
            subtitle={nextExamDisplay}
            icon={Clock}
            onClick={() => navigate('/timeline')}
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-white/[0.03] to-white/[0.01]"
            accentColor="text-blue-400"
          />

          {/* 2. Import (Top Right) */}
          <BentoCard 
            title={t('welcome.import')}
            subtitle={t('import.desc')}
            icon={Settings}
            onClick={() => navigate('/import')}
            className="md:col-span-1"
            accentColor="text-purple-400"
          />

          {/* 3. Example (Bottom Right) */}
          <BentoCard 
            title={t('welcome.example')}
            subtitle="Playground Mode"
            icon={PlayCircle}
            onClick={() => navigate('/example')}
            className="md:col-span-1"
            accentColor="text-emerald-400"
          />
        </div>

        {/* Footer Status Bar */}
        <motion.div 
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1.5, duration: 1 } } }}
          className="flex justify-between items-center text-xs font-mono text-gray-600 pt-8 border-t border-white/5"
        >
          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span>{new Date().getFullYear()} © KANBAN</span>
          </div>
          <button 
            onClick={toggleLanguage} 
            className="hover:text-white transition-colors uppercase tracking-widest"
          >
            {i18n.language === 'zh' ? 'EN / 中文' : 'ENGLISH / 中文'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
