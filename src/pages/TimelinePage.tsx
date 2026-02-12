import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Settings, History, X, Trash2, Check, Lock, Unlock, ShieldAlert, Plus, Info } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import useExamTimer from '../hooks/useExamTimer';
import FocusMode from '../components/FocusMode';
import AmbientMode from '../components/AmbientMode';
import CollectionMode from '../components/CollectionMode';
import AboutModal from '../components/AboutModal';
import { useTranslation } from 'react-i18next';

// Helper to format milliseconds into HH:MM:SS
const formatTime = (ms: number) => {
  if (ms < 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':');
};

const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSchedule, profiles, activeProfileId, setActiveProfile, deleteProfile, updateScheduleItem } = useSchedule();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t } = useTranslation();
  
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isKioskLocked, setIsKioskLocked] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  
  // Kiosk Lock Logic
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const [exitPressProgress, setExitPressProgress] = useState(0);
  const exitIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    currentStatus,
    currentExam,
    nextExam,
    timeUntilEnd,
    timeUntilNext
  } = useExamTimer({ schedule: activeSchedule, currentTime });

  // --- Handlers ---

  const handleExitPressStart = () => {
    if (!isKioskLocked) {
        navigate('/');
        return;
    }
    // Start Long Press logic
    let progress = 0;
    exitIntervalRef.current = setInterval(() => {
        progress += 5;
        setExitPressProgress(progress);
        if (progress >= 100) {
            if (exitIntervalRef.current) clearInterval(exitIntervalRef.current);
            setIsKioskLocked(false); // Unlock
            setExitPressProgress(0);
        }
    }, 50);
  };

  const handleExitPressEnd = () => {
    if (exitIntervalRef.current) {
        clearInterval(exitIntervalRef.current);
        setExitPressProgress(0);
    }
  };

  const handleEmergencyDelay = (minutes: number) => {
      if (currentExam) {
          const newEndTime = new Date(currentExam.endTime.getTime() + minutes * 60000);
          updateScheduleItem(currentExam.id, { endTime: newEndTime });
      }
  };

  // --- Render Content ---

  let content;

  switch (currentStatus) {
    case 'active':
      content = (
        <FocusMode
          key="focus"
          currentExam={currentExam}
          timeUntilEnd={timeUntilEnd}
          formatTime={formatTime}
          currentTime={currentTime}
        />
      );
      break;
    case 'collection':
       content = (
         <CollectionMode 
            key="collection"
            currentExam={currentExam!}
         />
       );
       break;
     case 'pending':
     case 'break':
       content = (
         <AmbientMode
           key="ambient"
           nextExam={nextExam}
           timeUntilNext={timeUntilNext}
           formatTime={formatTime}
           currentTime={currentTime}
         />
       );
       break;
    case 'finished':
      content = (
        <motion.div
          key="finished"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8"
        >
          <h1 className="text-5xl font-bold mb-4 text-gray-300">{t('timeline.all_finished')}</h1>
          <p className="text-2xl text-gray-500">{currentTime.toLocaleTimeString()}</p>
        </motion.div>
      );
      break;
    default:
      content = (
        <div className="fixed inset-0 h-screen w-screen bg-black flex flex-col items-center justify-center overflow-hidden font-['JetBrains_Mono'] selection:bg-white/20">
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)] pointer-events-none" />
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 flex flex-col items-center text-center"
          >
             <h1 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tighter uppercase select-none">
               {t('timeline.no_active_exam')}
             </h1>
          </motion.div>
           
           {/* Header Time (Moved from bottom) */}
           <div className="fixed top-6 left-6 text-gray-800 text-xs md:text-sm font-mono tracking-widest">
             {currentTime.toLocaleTimeString()}
           </div>
        </div>
      );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans bg-black">
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {content}
      </AnimatePresence>

      {/* --- Controls Overlay (Bottom Left) --- */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 flex gap-2 sm:gap-4 group">
        
        {/* Exit / Back Button (With Kiosk Logic) */}
        <div className="relative">
            {/* Progress Ring for Long Press */}
            {exitPressProgress > 0 && (
                <svg className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none scale-125">
                    <circle cx="50%" cy="50%" r="20" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
                    <circle cx="50%" cy="50%" r="20" stroke="white" strokeWidth="4" fill="none" 
                        strokeDasharray="126" strokeDashoffset={126 - (126 * exitPressProgress) / 100} 
                    />
                </svg>
            )}
            <button 
            ref={exitButtonRef}
            onMouseDown={handleExitPressStart}
            onMouseUp={handleExitPressEnd}
            onMouseLeave={handleExitPressEnd}
            onTouchStart={handleExitPressStart}
            onTouchEnd={handleExitPressEnd}
            className={`p-2.5 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300 relative overflow-hidden ${isKioskLocked ? 'bg-red-900/50 text-red-200 hover:bg-red-900/80' : 'bg-black/20 hover:bg-black/60 text-white'}`}
            title={isKioskLocked ? t('emergency.unlock_exit') : t('timeline.exit')}
            >
            {isKioskLocked ? <Lock size={20} className="sm:w-6 sm:h-6" /> : <ArrowLeft size={20} className="sm:w-6 sm:h-6" />}
            </button>
        </div>

        {/* History Button (Hidden if Locked) */}
        {!isKioskLocked && (
            <button 
            onClick={() => setShowHistory(true)}
            className="bg-black/20 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-sm transition-all"
            title={t('timeline.select_history')}
            >
            <History size={20} className="sm:w-6 sm:h-6" />
            </button>
        )}

        {/* Kiosk Lock Toggle (Hidden if Locked, shown on hover) */}
        {!isKioskLocked && (
             <button 
             onClick={() => setIsKioskLocked(true)}
             className="bg-black/20 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-sm transition-all"
             title="Lock Interface (Kiosk Mode)"
             >
             <Unlock size={20} className="sm:w-6 sm:h-6" />
             </button>
        )}
      </div>

      {/* --- Bottom Right: Settings & Emergency --- */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
         
         <div className="flex gap-2 sm:gap-4">
            {/* Emergency Toggle (Only if active exam) */}
            {currentStatus === 'active' && (
                <button
                    onClick={() => setShowEmergency(!showEmergency)}
                    className={`p-2.5 sm:p-3 rounded-full backdrop-blur-sm transition-colors ${showEmergency ? 'bg-amber-600 text-white' : 'bg-black/40 hover:bg-amber-900/60 text-amber-500'}`}
                    title={t('emergency.title')}
                >
                    <ShieldAlert size={20} className="sm:w-6 sm:h-6" />
                </button>
            )}

            {/* About Button (Hidden if locked) */}
            {!isKioskLocked && (
                <button 
                    onClick={() => setShowAbout(true)}
                    className="bg-black/40 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-sm"
                    title={t('about.title')}
                >
                <Info size={20} className="sm:w-6 sm:h-6" />
                </button>
            )}

            {/* Settings (Hidden if locked) */}
            {!isKioskLocked && (
                <button 
                    onClick={() => navigate('/import')}
                    className="bg-black/40 hover:bg-black/60 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-sm"
                >
                <Settings size={20} className="sm:w-6 sm:h-6" />
                </button>
            )}
         </div>
         
         {/* Author Footer - Hidden on mobile */}
         {!isKioskLocked && (
             <div className="hidden sm:block text-[10px] text-gray-500 font-mono tracking-widest mt-1 select-none">
                 © 2025 Xinhe Hu | GPLv3
             </div>
         )}
      </div>

      {/* --- About Modal --- */}
      <AnimatePresence>
        {showAbout && <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />}
      </AnimatePresence>

      {/* --- Emergency Dashboard Overlay --- */}
      <AnimatePresence>
        {showEmergency && currentExam && (
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="fixed bottom-24 right-6 z-40 bg-black/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 w-64 shadow-2xl"
            >
                <h3 className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                    <ShieldAlert size={14} /> {t('emergency.title')}
                </h3>
                
                <div className="space-y-2">
                    <div className="text-gray-400 text-xs mb-2">{t('emergency.delay_current')}</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => handleEmergencyDelay(1)}
                            className="flex items-center justify-center gap-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/20 rounded-lg transition-colors text-sm font-mono"
                        >
                            <Plus size={14} /> {t('emergency.add_1_min')}
                        </button>
                        <button 
                            onClick={() => handleEmergencyDelay(5)}
                            className="flex items-center justify-center gap-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/20 rounded-lg transition-colors text-sm font-mono"
                        >
                            <Plus size={14} /> {t('emergency.add_5_min')}
                        </button>
                    </div>
                    <div className="pt-2 border-t border-white/10 mt-2">
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>{t('emergency.current_end')}</span>
                            <span>{currentExam.endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- History Drawer (Unchanged) --- */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-full md:w-80 bg-gray-900 border-r border-gray-800 z-50 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">{t('timeline.history_list')}</h2>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[80vh]">
                {profiles.map(profile => (
                  <div 
                    key={profile.id}
                    onClick={() => setActiveProfile(profile.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all group relative ${
                      activeProfileId === profile.id 
                        ? 'bg-blue-600/20 border-blue-500 text-white' 
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold pr-8">{profile.name}</div>
                    <div className="text-xs opacity-60 mt-1">{new Date(profile.lastModified).toLocaleDateString()}</div>
                    
                    {activeProfileId === profile.id && (
                      <Check className="absolute top-4 right-4 text-blue-400" size={18} />
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelinePage;