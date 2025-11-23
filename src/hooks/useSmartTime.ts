import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSmartTimeOptions {
  initialTime?: Date;
  speed?: number; // 1x speed by default. Could be used for fast-forwarding.
}

export const useSmartTime = ({ initialTime = new Date(), speed = 1 }: UseSmartTimeOptions = {}) => {
  // The source of truth for time
  const [currentTime, setCurrentTime] = useState<Date>(initialTime);
  
  // Is the user currently manipulating the time manually?
  const [isPaused, setIsPaused] = useState(false);

  // Ref to track time for the animation loop to avoid dependency cycles
  const timeRef = useRef<Date>(initialTime);
  const lastTickRef = useRef<number>(Date.now());

  // Sync ref when state updates manually
  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  // The engine: runs only when not paused
  useEffect(() => {
    if (isPaused) return;

    let animationFrameId: number;

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      
      // Update on every frame for smooth slider movement
      // We want to ADD the delta to the *simulated* time
      const newTime = new Date(timeRef.current.getTime() + delta * speed);
      timeRef.current = newTime;
      setCurrentTime(newTime);
      lastTickRef.current = now;

      animationFrameId = requestAnimationFrame(tick);
    };

    lastTickRef.current = Date.now();
    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, speed]);

  // External control interface
  const seekTo = useCallback((date: Date) => {
    // When seeking, we pause automatic flow temporarily if dragging, 
    // but here we just update the value. The parent controls 'pause' state via setManualMode.
    setCurrentTime(date);
    timeRef.current = date;
  }, []);

  const setManualMode = useCallback((enabled: boolean) => {
    setIsPaused(enabled);
    if (!enabled) {
      // When resuming, reset the tick reference so we don't jump
      lastTickRef.current = Date.now();
    }
  }, []);

  return {
    currentTime,
    seekTo,
    setManualMode,
    isPaused
  };
};
