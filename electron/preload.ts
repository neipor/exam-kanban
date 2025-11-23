import { contextBridge, ipcRenderer } from 'electron';
import { type ScheduleProfile } from '../src/types';

// Define a type for the exposed API
export interface IElectronAPI {
  loadProfiles: () => Promise<ScheduleProfile[]>;
  saveProfiles: (profiles: ScheduleProfile[]) => Promise<void>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  loadProfiles: () => ipcRenderer.invoke('load-profiles'),
  saveProfiles: (profiles: ScheduleProfile[]) => ipcRenderer.invoke('save-profiles', profiles),
});