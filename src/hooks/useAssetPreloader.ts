import { useEffect, useRef, useCallback } from "react";

// In-memory cache to prevent reloading between component mounts
const loadedAssets = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

/**
 * Preloads images and caches them in memory.
 * Assets are only loaded once across the entire app lifecycle.
 */
export function useAssetPreloader(assets: string[]): {
  isLoaded: boolean;
  preloadNow: () => Promise<void>;
} {
  const loadedCountRef = useRef(0);
  const totalAssets = assets.length;
  
  const preloadSingle = useCallback((src: string): Promise<void> => {
    // Already loaded
    if (loadedAssets.has(src)) {
      return Promise.resolve();
    }
    
    // Already loading
    if (loadingPromises.has(src)) {
      return loadingPromises.get(src)!;
    }
    
    // Start loading
    const promise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        loadedAssets.add(src);
        loadingPromises.delete(src);
        resolve();
      };
      img.onerror = () => {
        // Still mark as loaded to prevent retry loops
        loadedAssets.add(src);
        loadingPromises.delete(src);
        resolve();
      };
      img.src = src;
    });
    
    loadingPromises.set(src, promise);
    return promise;
  }, []);

  const preloadNow = useCallback(async () => {
    await Promise.all(assets.map(preloadSingle));
  }, [assets, preloadSingle]);

  // Check if all assets are already loaded
  const isLoaded = assets.every(src => loadedAssets.has(src));

  // Start preloading on mount if not already loaded
  useEffect(() => {
    if (!isLoaded) {
      // Use requestIdleCallback for non-blocking preload, with setTimeout fallback
      const schedulePreload = typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1);
      
      schedulePreload(() => {
        preloadNow();
      });
    }
  }, [isLoaded, preloadNow]);

  return { isLoaded, preloadNow };
}

/**
 * Imperatively preload assets without a hook.
 * Useful for preloading before a component mounts.
 */
export function preloadAssets(assets: string[]): Promise<void[]> {
  return Promise.all(
    assets.map((src) => {
      if (loadedAssets.has(src)) {
        return Promise.resolve();
      }
      
      if (loadingPromises.has(src)) {
        return loadingPromises.get(src)!;
      }
      
      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedAssets.add(src);
          loadingPromises.delete(src);
          resolve();
        };
        img.onerror = () => {
          loadedAssets.add(src);
          loadingPromises.delete(src);
          resolve();
        };
        img.src = src;
      });
      
      loadingPromises.set(src, promise);
      return promise;
    })
  );
}

/**
 * Check if an asset is already loaded
 */
export function isAssetLoaded(src: string): boolean {
  return loadedAssets.has(src);
}
