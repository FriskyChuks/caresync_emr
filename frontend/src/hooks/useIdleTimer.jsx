import { useEffect, useRef, useState } from "react";

/**
 * Single source of truth for idle timing.
 * Exported constants for reuse:
 *  - DEFAULT_IDLE_TIME: total inactivity (ms) before logout
 *  - WARN_BEFORE: milliseconds before logout to show warning modal
 *
 * Hook usage:
 * const { isWarning, remaining, resetTimer, cancel } = useIdleTimer({
 *   onIdle: () => logout(),
 *   idleTime: DEFAULT_IDLE_TIME, // optional override
 *   warnBefore: WARN_BEFORE,     // optional override
 * });
 */
export const DEFAULT_IDLE_TIME = 15 * 60 * 1000; // 15 minutes
export const WARN_BEFORE = 60 * 1000; // 1 minute

export function useIdleTimer({
  onIdle,
  idleTime = DEFAULT_IDLE_TIME,
  warnBefore = WARN_BEFORE,
  listenEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"],
} = {}) {
  const warnDelay = Math.max(0, idleTime - warnBefore);

  const warnTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const [isWarning, setIsWarning] = useState(false);
  const [remaining, setRemaining] = useState(Math.ceil(warnBefore / 1000));

  // clear all timers and state
  const clearAll = () => {
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current);
      warnTimerRef.current = null;
    }
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIsWarning(false);
    setRemaining(Math.ceil(warnBefore / 1000));
  };

  const startCountdown = () => {
    // start countdown from warnBefore seconds
    let sec = Math.ceil(warnBefore / 1000);
    setRemaining(sec);

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    countdownRef.current = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        setRemaining(0);
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      } else {
        setRemaining(sec);
      }
    }, 1000);
  };

  const startTimers = () => {
    clearAll();

    // schedule warning (if warnBefore > 0)
    if (warnBefore > 0) {
      if (warnDelay > 0) {
        warnTimerRef.current = setTimeout(() => {
          setIsWarning(true);
          startCountdown();
        }, warnDelay);
      } else {
        // immediate warning when warnBefore >= idleTime
        setIsWarning(true);
        startCountdown();
      }
    }

    // schedule idle logout
    idleTimerRef.current = setTimeout(() => {
      // finalize countdown/ warning
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setIsWarning(false);
      setRemaining(0);
      typeof onIdle === "function" && onIdle();
    }, idleTime);
  };

  const resetTimer = () => {
    // restart timers and hide warning
    clearAll();
    startTimers();
  };

  const cancel = () => {
    clearAll();
  };

  useEffect(() => {
    // on mount attach activity listeners that reset the timers
    const onActivity = () => resetTimer();
    listenEvents.forEach((evt) => window.addEventListener(evt, onActivity));

    // start timers when mounted
    startTimers();

    return () => {
      // cleanup
      listenEvents.forEach((evt) => window.removeEventListener(evt, onActivity));
      clearAll();
    };
    // note: if idleTime or warnBefore change we want timers to restart; include them in deps
  }, [idleTime, warnBefore, JSON.stringify(listenEvents)]);

  return { isWarning, remaining, resetTimer, cancel };
}

export default useIdleTimer;
