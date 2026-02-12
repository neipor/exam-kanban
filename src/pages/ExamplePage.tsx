import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Pause, X } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { useSmartTime } from '../hooks/useSmartTime';
import useExamTimer from '../hooks/useExamTimer';
import FocusMode from '../components/FocusMode';
import AmbientMode from '../components/AmbientMode';
import { AnimatePresence, motion } from 'framer-motion';

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

const ExamplePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeSchedule } = useSchedule();

  // Determine time range for the slider
  const { minTime, maxTime } = useMemo(() => {
    if (activeSchedule.length === 0) {
      const now = new Date();
      return { minTime: new Date(now.getTime() - 3600000), maxTime: new Date(now.getTime() + 3600000) };
    }
    const startTimes = activeSchedule.map(s => s.startTime.getTime());
    const endTimes = activeSchedule.map(s => s.endTime.getTime());
    // Start 1 hour before first exam, end 1 hour after last exam
    return {
      minTime: new Date(Math.min(...startTimes) - 3600000),
      maxTime: new Date(Math.max(...endTimes) + 3600000)
    };
  }, [activeSchedule]);

  const { currentTime, seekTo, setManualMode, isPaused } = useSmartTime({
    initialTime: minTime,
    speed: 1, // Force 1x speed for realistic flow
  });

  const {
    currentStatus,
    currentExam,
    nextExam,
    timeUntilEnd,
    timeUntilNext
  } = useExamTimer({ schedule: activeSchedule, currentTime });

  // Slider handlers
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setManualMode(true);
    seekTo(new Date(val));
  };

  const handleSliderRelease = () => {
    setManualMode(false);
  };

  // Content Rendering
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
    default:
      content = (
        <div className="fixed inset-0 h-full w-full bg-black flex flex-col items-center justify-center overflow-hidden font-['JetBrains_Mono'] selection:bg-white/20">
          {/* Background */}
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
        </div>
      );
  }

  // Calculate progress percentage
  const progress = ((currentTime.getTime() - minTime.getTime()) / (maxTime.getTime() - minTime.getTime())) * 100;

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col">
      {/* Main Display Area */}
      <div className="flex-1 relative pb-24">
        <AnimatePresence mode="wait">
          {content}
        </AnimatePresence>
      </div>

      {/* Bottom Bar / Controls Overlay */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-900/90 backdrop-blur-md border-t border-white/10 p-3 sm:p-4 flex items-center justify-between z-50 shadow-2xl">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white rounded-lg transition-all text-sm"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="font-semibold hidden sm:inline">{t('playground.exit')}</span>
          </button>
          <div className="hidden md:block">
             <h2 className="text-white font-semibold text-sm">{t('playground.title')}</h2>
             <p className="text-xs text-gray-400">{t('playground.instruction')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-3xl mx-2 sm:mx-4">
           <div className="text-mono text-blue-400 font-bold min-w-[80px] sm:min-w-[100px] text-center text-sm sm:text-lg font-['JetBrains_Mono']">
             {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </div>
           
           <div className="relative flex-1 h-10 sm:h-12 flex items-center group">
             {/* Slider */}
             <input
                type="range"
                min={minTime.getTime()}
                max={maxTime.getTime()}
                step={100} 
                value={currentTime.getTime()}
                onChange={handleSliderChange}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 m-0 p-0"
              />
              
              {/* Visual Track */}
              <div className="w-full h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden relative z-10 pointer-events-none">
                <div 
                   className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                   style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Thumb */}
              <div 
                 className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] transform -translate-x-1/2 pointer-events-none z-20 transition-transform duration-75"
                 style={{ left: `${progress}%` }}
              />
            </div>

            <button 
              onClick={() => setManualMode(!isPaused)}
              className="p-2.5 sm:p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg transition-all active:scale-95 flex-shrink-0"
            >
              {isPaused ? <Play size={18} className="sm:w-5 sm:h-5" fill="currentColor" /> : <Pause size={18} className="sm:w-5 sm:h-5" fill="currentColor" />}
            </button>
         </div>
       </div>
    </div>
  );
};

export default ExamplePage;