// Shared type definitions

export interface ExamScheduleItem {
  id: string;
  subject: string;
  startTime: Date;
  endTime: Date;
}

export interface ScheduleProfile {
  id: string;
  name: string;
  schedule: ExamScheduleItem[];
  lastModified: number;
}

export type ExamStatus = 'idle' | 'pending' | 'active' | 'collection' | 'break' | 'finished';

export interface ExamTimerState {
  currentStatus: ExamStatus;
  currentExam: ExamScheduleItem | null;
  nextExam: ExamScheduleItem | null;
  timeUntilNext: number; // in milliseconds
  timeUntilEnd: number; // in milliseconds
  examSchedule: ExamScheduleItem[];
}
