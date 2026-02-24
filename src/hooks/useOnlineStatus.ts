import { useState, useEffect, useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

const getSnapshot = () => navigator.onLine;

/** Reactive hook that tracks navigator.onLine via useSyncExternalStore */
export const useOnlineStatus = () => {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
};
