import { useRef, useCallback, useEffect } from "react";

/**
 * Hook to manage Screen Wake Lock API
 * Keeps the screen awake when active (e.g., during recording or AI processing)
 */
export const useWakeLock = () => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    // Check if the API is supported
    if (!("wakeLock" in navigator)) {
      return false;
    }

    try {
      // Release any existing wake lock first
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }

      wakeLockRef.current = await navigator.wakeLock.request("screen");

      return true;
    } catch {
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch {
        // Silent fail on release
      }
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  return { requestWakeLock, releaseWakeLock };
};
