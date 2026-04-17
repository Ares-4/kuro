import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const useInactivityLogout = (logoutCallback, redirectPath = '/login') => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const handleLogout = useCallback(() => {
    if (logoutCallback) {
      logoutCallback();
    }
    navigate(redirectPath);
  }, [logoutCallback, navigate, redirectPath]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
  }, [handleLogout]);

  useEffect(() => {
    // Initial timer
    resetTimer();

    // Event listeners for activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttle the reset to avoid performance issues on scroll
    let throttleTimer;
    const throttledReset = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          resetTimer();
          throttleTimer = null;
        }, 1000); // Only reset max once per second
      }
    };

    events.forEach(event => {
      window.addEventListener(event, throttledReset);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      events.forEach(event => {
        window.removeEventListener(event, throttledReset);
      });
    };
  }, [resetTimer]);

  const getTimeRemaining = () => {
    const elapsed = Date.now() - lastActivityRef.current;
    return Math.max(0, Math.ceil((TIMEOUT_DURATION - elapsed) / 1000));
  };

  return { getTimeRemaining };
};