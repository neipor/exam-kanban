import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, Save, PlayCircle, Clock, Calendar, Edit3, X } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { type ExamScheduleItem } from '../types';

const InputStyles = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.05] focus:outline-none transition-all duration-200";

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    activeSchedule, 
    updateActiveSchedule, 
    activeProfileId, 
    profiles 
  } = useSchedule();
  
  const activeProfileName = profiles.find(p => p.id === activeProfileId)?.name || t('import.profile_name');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

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

  const addMinutes = (setter: (val: string) => void, currentVal: string, minutes: number) => {
    const base = currentVal ? new Date(currentVal) : new Date();
    const newTime = new Date(base.getTime() + minutes * 60000);
    setter(toLocalISO(newTime));
  };

  const checkConflict = (start: Date, end: Date, excludeId?: string) => {
    return activeSchedule.find(item => {
      if (excludeId && item.id === excludeId) return false;
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

    const conflict = checkConflict(startTime, endTime, editingId || undefined);
    if (conflict) {
        alert(`${t('import.conflict_error')} ${conflict.subject}`);
        return;
    }

    if (editingId) {
        const updatedSchedule = activeSchedule.map(item => 
            item.id === editingId 
                ? { ...item, subject: newSubject, startTime, endTime }
                : item
        );
        updateActiveSchedule(updatedSchedule);
        setEditingId(null);
    } else {
        const newItem: ExamScheduleItem = {
            id: Math.random().toString(36).substr(2, 9),
            subject: newSubject,
            startTime,
            endTime,
        };
        updateActiveSchedule([...activeSchedule, newItem]);
    }

    setNewSubject('');
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

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#050505] flex flex-col overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#050505] to-black pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full p-6 md:p-8 gap-6 pb-32">
        
        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 max-h-full pb-48">
            
            {/* Add/Edit Exam Panel */}
            <div className={`bg-white/[0.02] backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${editingId ? 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                    </div>
                    <h2 className="text-lg font-medium text-white/90">
                      {editingId ? t('import.edit_mode') : t('import.add_exam')}
                    </h2>
                  </div>
                  {editingId && (
                      <button onClick={handleCancelEdit} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                          <X size={18} />
                      </button>
                  )}
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-medium block mb-2">
                    {t('import.subject_label')}
                  </label>
                  <input
                    className={InputStyles}
                    placeholder={t('import.subject_ph')}
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-5">
                   <div>
                      <label className="text-[11px] uppercase tracking-wider text-white/40 font-medium block mb-2">
                        {t('import.start_time_label')}
                      </label>
                      <input
                        type="datetime-local"
                        className={`${InputStyles} font-mono text-sm [color-scheme:dark]`}
                        value={newStart}
                        onChange={e => setNewStart(e.target.value)}
                      />
                      <div className="flex gap-2 mt-3">
                        {[15, 30, 60].map((min) => (
                          <button 
                            key={min}
                            onClick={() => addMinutes(setNewStart, newStart, min)}
                            className="flex-1 py-2 text-[11px] font-medium text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-lg transition-all duration-200"
                          >
                            +{min >= 60 ? `${min/60}h` : `${min}m`}
                          </button>
                        ))}
                      </div>
                   </div>
                   
                   <div>
                      <label className="text-[11px] uppercase tracking-wider text-white/40 font-medium block mb-2">
                        {t('import.end_time_label')}
                      </label>
                      <input
                        type="datetime-local"
                        className={`${InputStyles} font-mono text-sm [color-scheme:dark]`}
                        value={newEnd}
                        onChange={e => setNewEnd(e.target.value)}
                      />
                      <div className="flex gap-2 mt-3">
                        {[15, 30, 60].map((min) => (
                          <button 
                            key={min}
                            onClick={() => addMinutes(setNewEnd, newEnd, min)}
                            className="flex-1 py-2 text-[11px] font-medium text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-lg transition-all duration-200"
                          >
                            +{min >= 60 ? `${min/60}h` : `${min}m`}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleSaveItem}
                  disabled={!newSubject || !newStart || !newEnd}
                  className={`w-full py-3.5 rounded-xl font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2 ${
                      editingId 
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                        : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {editingId ? <Save size={18} /> : <Plus size={18} />}
                  <span>{editingId ? t('import.update_btn') : t('import.add_to_schedule')}</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Schedule List */}
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.06] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.03] text-white/50">
                    <Calendar size={18} />
                  </div>
                  <h2 className="text-lg font-medium text-white/90">
                    {t('import.current_schedule')}
                  </h2>
                </div>
                <span className="text-xs font-mono text-white/40 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/[0.06]">
                  {activeSchedule.length} {t('import.items_count')}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeSchedule.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/20">
                    <Clock size={40} strokeWidth={1} className="mb-4 opacity-50" />
                    <p className="text-sm font-light">{t('import.no_exams')}</p>
                  </div>
                ) : (
                  activeSchedule
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                    .map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleEdit(item)} 
                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          editingId === item.id 
                            ? 'bg-blue-500/[0.08] border-blue-500/30' 
                            : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.1]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center w-11 h-11 rounded-lg font-mono text-xs ${editingId === item.id ? 'bg-blue-500/20 text-blue-300' : 'bg-white/[0.04] text-white/50'}`}>
                          <span className="text-sm">{item.startTime.getHours().toString().padStart(2, '0')}</span>
                          <span className="text-[10px] opacity-50">{item.startTime.getMinutes().toString().padStart(2, '0')}</span>
                        </div>
                        <div>
                          <h3 className={`font-medium text-base ${editingId === item.id ? 'text-blue-200' : 'text-white/80'}`}>
                            {item.subject}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/40 font-mono">
                             <span className="flex items-center gap-1.5">
                               <Clock size={10} /> 
                               {item.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {item.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                             <span className="w-1 h-1 rounded-full bg-white/20" />
                             <span>{Math.round((item.endTime.getTime() - item.startTime.getTime()) / 60000)} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                          {editingId === item.id && (
                            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-medium">
                              {t('import.edit_mode')}
                            </span>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#050505]/90 backdrop-blur-2xl border-t border-white/[0.06] p-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-5">
                <button 
                onClick={() => navigate('/')} 
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                >
                <ArrowLeft size={20} className="text-white/60" />
                </button>
                <div>
                <h1 className="text-xl font-medium text-white/90 tracking-tight">{t('import.title')}</h1>
                <div className="flex items-center gap-2 text-xs text-white/40 mt-1 font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {activeProfileName}
                </div>
                </div>
            </div>
            
            <button 
                onClick={() => navigate('/timeline')}
                className="px-6 py-3.5 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-white/10"
            >
                <PlayCircle size={20} />
                <span>{t('import.start_btn')}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
