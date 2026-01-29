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
      console.log("Wake Lock API not supported");
      return false;
    }

    try {
      // Release any existing wake lock first
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }

      wakeLockRef.current = await navigator.wakeLock.request("screen");
      console.log("Wake lock acquired");

      // Handle visibility change - re-acquire if page becomes visible again
      wakeLockRef.current.addEventListener("release", () => {
        console.log("Wake lock released");
      });

      return true;
    } catch (err) {
      console.error("Failed to acquire wake lock:", err);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log("Wake lock released");
      } catch (err) {
        console.error("Failed to release wake lock:", err);
      }
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(console.error);
      }
    };
  }, []);

  return { requestWakeLock, releaseWakeLock };
};
