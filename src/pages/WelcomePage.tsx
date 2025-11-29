import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { Clock, Settings, PlayCircle, ArrowRight, Info } from 'lucide-react'; // Reverted to safe icons
import { useSchedule } from '../context/ScheduleContext';
import AboutModal from '../components/AboutModal';

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
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { 
    scaleX: 1, 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 }, // Reduced movement distance
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    // Use standard easing instead of spring for better performance on low-end devices
    transition: { duration: 0.5, ease: "circOut" } 
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
    style={{ willChange: "transform, opacity" }} // Hint browser to optimize
    className={`relative flex flex-col justify-between p-6 md:p-8 rounded-3xl cursor-pointer transition-colors duration-200 group overflow-hidden bg-[#111]/90 border border-white/10 hover:bg-[#1a1a1a] hover:border-white/30 ${className}`}
  >
    {/* Hover Highlight Gradient Overlay - Simplified */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

    <div className="flex justify-between items-start z-10">
      <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 text-white transition-colors group-hover:bg-white/10 ${accentColor}`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-2 -mt-2">
        <ArrowRight className="text-white/50" />
      </div>
    </div>

    <div className="z-10 mt-6 md:mt-8">
      <h3 className="text-xl md:text-2xl font-bold text-white/90 mb-1 tracking-tight group-hover:text-white transition-colors">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 font-light tracking-wide group-hover:text-gray-300 transition-colors truncate">{subtitle}</p>}
    </div>
  </motion.div>
);

const WelcomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeSchedule } = useSchedule();
  const [showAbout, setShowAbout] = React.useState(false);

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
    <div className="fixed inset-0 min-h-[100dvh] w-screen bg-black flex flex-col items-center py-12 px-4 md:px-6 overflow-y-auto font-['Outfit'] text-white selection:bg-blue-500/30 selection:text-blue-200 supports-[height:100dvh]:h-[100dvh]">
      
      {/* 1. Background: Breathing Dot Matrix - Optimized opacity animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }} 
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          willChange: 'opacity'
        }}
      />
      
      {/* 2. Ambient Spotlight (Center) - Responsive sizing */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] max-w-[1000px] max-h-[1000px] pointer-events-none rounded-full"
        style={{
            background: 'radial-gradient(circle, rgba(30, 58, 138, 0.2) 0%, transparent 70%)',
            willChange: 'transform'
        }}
      />
      
      {/* 3. Vignette Mask - Lighter for better visibility on bad screens */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,black_100%)] pointer-events-none" />

      {/* Main Content Container - Responsive Width */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-7xl flex flex-col gap-6 md:gap-12 my-auto px-2 md:px-0"
      >
        {/* Header Section */}
        <div className="text-center space-y-2 md:space-y-4">
          <motion.h1 
            variants={titleVariants}
            style={{ willChange: 'transform, opacity' }}
            className="text-[10vmin] md:text-7xl lg:text-8xl font-bold tracking-tighter text-white drop-shadow-sm leading-none"
          >
            {t('welcome.title')}
          </motion.h1>
          <motion.div className="flex items-center justify-center gap-4">
             <motion.div 
                variants={lineVariants} 
                style={{ originX: 1 }}
                className="h-[1px] w-8 md:w-12 bg-gradient-to-r from-transparent to-gray-600" 
             />
             <motion.p 
               variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1 } } }}
               className="text-[10px] md:text-sm lg:text-base font-medium text-gray-400 tracking-[0.3em] md:tracking-[0.4em] uppercase"
             >
               EXAM KANBAN SYSTEM
             </motion.p>
             <motion.div 
                variants={lineVariants} 
                style={{ originX: 0 }}
                className="h-[1px] w-8 md:w-12 bg-gradient-to-l from-transparent to-gray-600" 
             />
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 h-auto md:h-[400px]">
          
          {/* 1. Timeline: Hero Card (Span 2 cols) */}
          <BentoCard 
            title={t('welcome.timeline')}
            subtitle={nextExamDisplay}
            icon={Clock}
            onClick={() => navigate('/timeline')}
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#111]"
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
          <div className="flex gap-6">
            <button 
                onClick={() => setShowAbout(true)}
                className="hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
                <Info size={14} />
                ABOUT
            </button>
            <button 
                onClick={toggleLanguage} 
                className="hover:text-white transition-colors uppercase tracking-widest"
            >
                {i18n.language === 'zh' ? 'EN / 中文' : 'ENGLISH / 中文'}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage;
