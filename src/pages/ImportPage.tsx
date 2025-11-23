import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, Plus, Trash2, Save, PlayCircle, Clock, FileJson, Calendar, Edit3, X, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { type ExamScheduleItem } from '../types';

// --- Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

// --- UI Components ---
const GlassPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const InputStyles = "w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-['Outfit']";

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    activeSchedule, 
    updateActiveSchedule, 
    saveProfile, 
    activeProfileId, 
    profiles 
  } = useSchedule();
  
  const activeProfileName = profiles.find(p => p.id === activeProfileId)?.name || t('import.profile_name');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  
  // Advanced Settings State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    if (!editingId) {
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        setNewStart(toLocalISO(now));
        setNewEnd(toLocalISO(nextHour));
    }
  }, [editingId]);

  const toLocalISO = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const imported: ExamScheduleItem[] = parsed.map((item: any) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            subject: item.subject || 'Untitled',
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime),
          }));
          saveProfile(`Imported ${new Date().toLocaleTimeString()}`, imported);
          alert('Import Successful');
        }
      } catch (err) { alert('Invalid JSON file.'); }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeSchedule, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `exam-schedule-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const checkConflict = (start: Date, end: Date, excludeId?: string) => {
    return activeSchedule.find(item => {
      if (excludeId && item.id === excludeId) return false;
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      return start.getTime() < item.endTime.getTime() && end.getTime() > item.startTime.getTime();
    });
  };

  const handleSaveItem = () => {
    if (!newSubject || !newStart || !newEnd) return;
    
    const startTime = new Date(newStart);
    const endTime = new Date(newEnd);

    if (startTime >= endTime) {
        alert("End time must be after start time.");
        return;
    }

    // Check Conflict
    const conflict = checkConflict(startTime, endTime, editingId || undefined);
    if (conflict) {
        alert(`${t('import.conflict_error')} ${conflict.subject} (${conflict.startTime.toLocaleTimeString()} - ${conflict.endTime.toLocaleTimeString()})`);
        return;
    }

    if (editingId) {
        // Update existing
        const updatedSchedule = activeSchedule.map(item => 
            item.id === editingId 
                ? { ...item, subject: newSubject, startTime, endTime }
                : item
        );
        updateActiveSchedule(updatedSchedule);
        setEditingId(null); // Exit edit mode
    } else {
        // Add new
        const newItem: ExamScheduleItem = {
            id: Math.random().toString(36).substr(2, 9),
            subject: newSubject,
            startTime,
            endTime,
        };
        updateActiveSchedule([...activeSchedule, newItem]);
    }

    // Reset form
    setNewSubject('');
    // Time resets via useEffect when editingId becomes null, or we force it here for 'Add' flow
    if (!editingId) {
        const now = new Date();
        setNewStart(toLocalISO(now));
        setNewEnd(toLocalISO(new Date(now.getTime() + 3600000)));
    }
  };

  const handleEdit = (item: ExamScheduleItem) => {
    setEditingId(item.id);
    setNewSubject(item.subject);
    setNewStart(toLocalISO(item.startTime));
    setNewEnd(toLocalISO(item.endTime));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewSubject('');
    const now = new Date();
    setNewStart(toLocalISO(now));
    setNewEnd(toLocalISO(new Date(now.getTime() + 3600000)));
  };

  const handleDelete = (id: string) => {
    if (editingId === id) handleCancelEdit();
    updateActiveSchedule(activeSchedule.filter(i => i.id !== id));
  };

  const setCurrentTime = (setter: (val: string) => void) => {
    const now = new Date();
    setter(toLocalISO(now));
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex flex-col overflow-hidden font-['Outfit'] text-white selection:bg-white/20">
      
      {/* --- Background --- */}
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)] pointer-events-none" />

      {/* --- Main Layout --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 flex flex-col h-full max-w-7xl mx-auto w-full p-6 md:p-8 gap-6 pb-32"
      >
        
        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT COLUMN: Controls */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 max-h-full pb-48">
            
            {/* Add/Edit Exam Panel */}
            <GlassPanel className={`flex flex-col gap-4 transition-colors duration-500 ${editingId ? 'bg-blue-900/10 border-blue-500/30' : ''}`}>
              <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                    {editingId ? <Edit3 size={18} className="text-amber-400" /> : <Plus size={18} className="text-blue-400" />} 
                    {editingId ? t('import.edit_mode') : t('import.add_exam')}
                  </h2>
                  {editingId && (
                      <button onClick={handleCancelEdit} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                          <X size={12} /> {t('import.cancel_edit')}
                      </button>
                  )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">{t('import.subject_label')}</label>
                  <input
                    className={InputStyles}
                    placeholder={t('import.subject_ph')}
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveItem()}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                   <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block flex justify-between items-end">
                        {t('import.start_time_label')}
                        <button 
                          onClick={() => setCurrentTime(setNewStart)} 
                          className="text-[10px] font-bold tracking-widest text-blue-400/70 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
                        >
                          {t('import.now_btn')}
                        </button>
                      </label>
                      <input
                        type="datetime-local"
                        className={`${InputStyles} font-mono text-sm`}
                        value={newStart}
                        onChange={e => setNewStart(e.target.value)}
                      />
                   </div>
                   <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block flex justify-between items-end">
                        {t('import.end_time_label')}
                        <button 
                          onClick={() => setCurrentTime(setNewEnd)} 
                          className="text-[10px] font-bold tracking-widest text-blue-400/70 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
                        >
                          {t('import.now_btn')}
                        </button>
                      </label>
                      <input
                        type="datetime-local"
                        className={`${InputStyles} font-mono text-sm`}
                        value={newEnd}
                        onChange={e => setNewEnd(e.target.value)}
                      />
                   </div>
                </div>

                <button 
                  onClick={handleSaveItem}
                  disabled={!newSubject || !newStart || !newEnd}
                  className={`w-full py-3 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2 group relative overflow-hidden ${
                      editingId 
                        ? 'bg-amber-600/20 border border-amber-500/50 text-amber-200 hover:bg-amber-600/40' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${editingId ? 'via-amber-400/10' : 'via-white/5'} to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none`} />
                  
                  {editingId ? <Save size={18} /> : <Plus size={18} className="group-hover:scale-110 transition-transform" />}
                  <span className="tracking-wide">{editingId ? t('import.update_btn') : t('import.add_to_schedule')}</span>
                </button>
              </div>
            </GlassPanel>

            {/* Advanced Options (Replaced JSON Import) */}
            <GlassPanel className="transition-all duration-300">
                <div 
                    className="flex items-center justify-between cursor-pointer select-none" 
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      {t('import.advanced') || 'Advanced'}
                    </h2>
                    {isAdvancedOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>

                <AnimatePresence>
                    {isAdvancedOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                            animate={{ height: 'auto', opacity: 1, marginTop: 16 }} 
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                             {/* Import */}
                             <div className="relative group cursor-pointer border border-dashed border-white/20 rounded-lg hover:border-white/40 transition-colors bg-white/5">
                               <input 
                                  type="file" 
                                  accept=".json" 
                                  onChange={handleFileUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                               <div className="flex flex-col items-center justify-center py-6 text-center">
                                  <Upload size={20} className="text-gray-400 group-hover:text-white mb-2 transition-colors" />
                                  <span className="text-xs text-gray-300">{t('import.upload_json')}</span>
                               </div>
                            </div>

                            {/* Export */}
                            <button 
                                onClick={handleExport}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
                            >
                                <Download size={18} />
                                <span className="text-sm">{t('import.export_json') || 'Export JSON'}</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassPanel>

          </motion.div>

          {/* RIGHT COLUMN: Schedule List */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col min-h-0">
            <GlassPanel className="flex-1 flex flex-col min-h-0 !p-0 overflow-hidden">
              <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.01]">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  {t('import.current_schedule')}
                </h2>
                <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-gray-300">
                  {activeSchedule.length} {t('import.items_count')}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {activeSchedule.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                    <FileJson size={48} strokeWidth={1} />
                    <p className="mt-4 text-sm font-light">{t('import.no_exams')}</p>
                  </div>
                ) : (
                  activeSchedule
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                    .map((item, index) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id}
                      onClick={() => handleEdit(item)} 
                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          editingId === item.id 
                            ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg font-mono text-xs transition-colors ${editingId === item.id ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                          <span>{item.startTime.getHours().toString().padStart(2, '0')}</span>
                          <span className="w-full h-[1px] bg-current opacity-20 my-0.5"></span>
                          <span>{item.startTime.getMinutes().toString().padStart(2, '0')}</span>
                        </div>
                        <div>
                          <h3 className={`font-medium transition-colors ${editingId === item.id ? 'text-blue-300' : 'text-gray-200 group-hover:text-white'}`}>{item.subject}</h3>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500 font-mono">
                             <span className="flex items-center gap-1"><Clock size={10} /> {item.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {item.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             <span className="text-gray-700">|</span>
                             <span>{Math.round((item.endTime.getTime() - item.startTime.getTime()) / 60000)} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          {editingId === item.id && <span className="text-xs text-blue-400 font-bold uppercase tracking-wider mr-2 animate-pulse">{t('import.edit_mode')}</span>}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassPanel>
          </motion.div>

        </div>
      </motion.div>

      {/* --- Bottom Bar --- */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 z-50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button 
                onClick={() => navigate('/')} 
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                >
                <ArrowLeft size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </button>
                <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('import.title')}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1 font-mono">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    {activeProfileName}
                </div>
                </div>
            </div>
            
            <button 
                onClick={() => navigate('/timeline')}
                className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-3 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] active:scale-95"
            >
                <PlayCircle size={24} />
                <span>{t('import.start_btn')}</span>
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ImportPage;
