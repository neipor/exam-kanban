import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { type ExamScheduleItem, type ScheduleProfile } from '../types';

interface ScheduleContextType {
  profiles: ScheduleProfile[];
  activeProfileId: string | null;
  activeSchedule: ExamScheduleItem[];
  saveProfile: (name: string, schedule: ExamScheduleItem[]) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  // Legacy support for direct edit of active profile
  updateActiveSchedule: (schedule: ExamScheduleItem[]) => void;
  updateScheduleItem: (id: string, updates: Partial<ExamScheduleItem>) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<ScheduleProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Helper to ensure dates are Date objects
  const hydrateProfiles = (rawProfiles: any[]): ScheduleProfile[] => {
    if (!Array.isArray(rawProfiles)) return [];
    return rawProfiles.map((p: any) => ({
      ...p,
      schedule: Array.isArray(p.schedule) ? p.schedule.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime)
      })) : []
    }));
  };

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      let loadedProfiles: ScheduleProfile[] = [];
      let source = 'default';

      // 1. Try Electron (File System)
      if (window.electronAPI) {
        try {
          const electronRaw = await window.electronAPI.loadProfiles();
          if (Array.isArray(electronRaw) && electronRaw.length > 0) {
            loadedProfiles = hydrateProfiles(electronRaw);
            source = 'electron';
          }
        } catch (e) {
           console.error("Electron load failed", e);
        }
      }

      // 2. Fallback to LocalStorage if Electron didn't yield results
      if (source !== 'electron') {
        const localProfiles = localStorage.getItem('examProfiles');
        if (localProfiles) {
          try {
            const parsed = JSON.parse(localProfiles);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedProfiles = hydrateProfiles(parsed);
              source = 'local';
            }
          } catch (e) { 
            console.error("Failed to parse profiles from localStorage", e);
          }
        }
      }

      // 3. Default sample if empty
      if (loadedProfiles.length === 0) {
        const now = new Date();
        const sampleSchedule = [
           { id: '1', subject: '示例：数学', startTime: new Date(now.getTime() + 3600000), endTime: new Date(now.getTime() + 7200000) }
        ];
        const defaultProfile = {
          id: 'default-sample',
          name: '默认示例 (Default)',
          schedule: sampleSchedule,
          lastModified: Date.now()
        };
        loadedProfiles = [defaultProfile];
      }

      setProfiles(loadedProfiles);
      // Auto-select the most recent one (or first)
      if (loadedProfiles.length > 0) {
        // Sort by lastModified desc? No, just take first for now.
        // Ideally we remember the last active ID in localStorage too.
        setActiveProfileId(loadedProfiles[0].id);
      }
    };
    loadData();
  }, []);

  // Save to persistence whenever profiles change
  useEffect(() => {
    if (profiles.length > 0) {
      // 1. Save to LocalStorage (Always acts as backup/web-store)
      localStorage.setItem('examProfiles', JSON.stringify(profiles));

      // 2. Save to Electron (File System)
      if (window.electronAPI) {
        window.electronAPI.saveProfiles(profiles).catch(e => console.error("Electron save failed", e));
      }
    }
  }, [profiles]);

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const activeSchedule = activeProfile ? activeProfile.schedule : [];

  const saveProfile = (name: string, newSchedule: ExamScheduleItem[]) => {
    const newProfile: ScheduleProfile = {
      id: Date.now().toString(),
      name,
      schedule: newSchedule,
      lastModified: Date.now()
    };
    setProfiles(prev => [newProfile, ...prev]);
    setActiveProfileId(newProfile.id);
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(null);
    }
  };

  const setActiveProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const updateActiveSchedule = (newSchedule: ExamScheduleItem[]) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, schedule: newSchedule, lastModified: Date.now() };
      }
      return p;
    }));
  };

  const updateScheduleItem = (itemId: string, updates: Partial<ExamScheduleItem>) => {
      if (!activeProfileId) return;
      setProfiles(prev => prev.map(p => {
          if (p.id === activeProfileId) {
              const newSchedule = p.schedule.map(item => 
                  item.id === itemId ? { ...item, ...updates } : item
              );
              return { ...p, schedule: newSchedule, lastModified: Date.now() };
          }
          return p;
      }));
  };

  return (
    <ScheduleContext.Provider value={{ 
      profiles, 
      activeProfileId, 
      activeSchedule, 
      saveProfile, 
      deleteProfile, 
      setActiveProfile,
      updateActiveSchedule,
      updateScheduleItem
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
