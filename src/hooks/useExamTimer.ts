import { useMemo } from 'react';
import { type ExamScheduleItem, type ExamTimerState } from '../types';

interface UseExamTimerProps {
  schedule: ExamScheduleItem[];
  currentTime: Date; // Controlled externally
}

const COLLECTION_DURATION_MS = 3 * 60 * 1000; // 3 minutes (Strict "Stop Writing" phase)

const useExamTimer = ({ schedule, currentTime }: UseExamTimerProps): ExamTimerState => {
  const examTimerState = useMemo<ExamTimerState>(() => {
    // Sort schedule by start time
    const sortedSchedule = [...schedule].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const currentMs = currentTime.getTime();
    
    // 1. Check for strictly active exam
    const activeExam = sortedSchedule.find(exam => 
      currentMs >= exam.startTime.getTime() && currentMs < exam.endTime.getTime()
    );

    if (activeExam) {
      const nextIndex = sortedSchedule.indexOf(activeExam) + 1;
      const nextExam = sortedSchedule[nextIndex] || null;
      return {
        currentStatus: 'active',
        currentExam: activeExam,
        nextExam,
        timeUntilEnd: activeExam.endTime.getTime() - currentMs,
        timeUntilNext: nextExam ? nextExam.startTime.getTime() - currentMs : 0,
        examSchedule: sortedSchedule
      };
    }

    // 2. Check for "Collection Period" (Strictly after exam ends, before Break)
    const collectionExam = sortedSchedule.find(exam => {
        const endTime = exam.endTime.getTime();
        // Active for COLLECTION_DURATION_MS after end
        return currentMs >= endTime && currentMs < (endTime + COLLECTION_DURATION_MS);
    });

    if (collectionExam) {
         const nextIndex = sortedSchedule.indexOf(collectionExam) + 1;
         const nextExam = sortedSchedule[nextIndex] || null;
         return {
             currentStatus: 'collection',
             currentExam: collectionExam,
             nextExam,
             timeUntilEnd: 0, // Exam is over
             timeUntilNext: nextExam ? nextExam.startTime.getTime() - currentMs : 0,
             examSchedule: sortedSchedule
         };
    }

    // 3. Check for "Overtime" (Just finished)
    // Only active if we are NOT in collection (implicit, since loop above catches it first if durations overlap, 
    // but actually we want Collection to take precedence over generic Overtime).
    // Actually, Overtime was the old "Active but negative" state.
    // Now we simply skip Overtime logic if Collection logic is sufficient, OR we keep Overtime for "visual continuity" 
    // if we want FocusMode to persist. 
    // Requirement: "Show Stop Writing". So 'collection' status is better than 'active'.
    // We can skip legacy Overtime logic here since we have a dedicated state.

    // 3. If not active or collection, look for next exam
    const nextExam = sortedSchedule.find(exam => exam.startTime.getTime() > currentMs);

    if (nextExam) {
      // We have a future exam. Check if we have any completed exams to decide Break vs Pending.
      const hasFinishedExams = sortedSchedule.some(exam => exam.endTime.getTime() <= currentMs);
      
      return {
        currentStatus: hasFinishedExams ? 'break' : 'pending',
        currentExam: null,
        nextExam,
        timeUntilEnd: 0,
        timeUntilNext: nextExam.startTime.getTime() - currentMs,
        examSchedule: sortedSchedule
      };
    }

    // 4. No future exams. Check if we are finished or idle (empty).
    const isFinished = sortedSchedule.length > 0 && sortedSchedule.every(exam => exam.endTime.getTime() <= currentMs);

    return {
      currentStatus: isFinished ? 'finished' : 'idle',
      currentExam: null,
      nextExam: null,
      timeUntilEnd: 0,
      timeUntilNext: 0,
      examSchedule: sortedSchedule
    };

  }, [schedule, currentTime]);

  return examTimerState;
};

export default useExamTimer;
