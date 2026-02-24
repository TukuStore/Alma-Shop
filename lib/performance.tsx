/**
 * Performance Optimization Utilities
 * Provides optimized FlatList configurations and memoized components
 */

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { FlatListProps, ListRenderItemInfo } from 'react-native';

// ─── Optimized FlatList Props Generator ─────────────────────
export interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;
  itemHeight?: number;
}

export function createOptimizedFlatListProps<T>(
  props: OptimizedFlatListProps<T>
): FlatListProps<T> {
  const { data, renderItem, itemHeight, ...rest } = props;

  return {
    ...rest,
    data,
    renderItem,
    keyExtractor: (item: any, index: number) => {
      // Custom key extractor - use item.id if available, otherwise index
      return item?.id?.toString() || index.toString();
    },
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    windowSize: 5,
    initialNumToRender: 5,
    ...(itemHeight && {
      getItemLayout: (data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
    }),
  };
}

// ─── Memoized List Item Components ───────────────────────────

/**
 * Higher-order component to memoize list items
 * Prevents unnecessary re-renders of list items
 */
export function memoizeListItem<T>(
  component: React.ComponentType<{ item: T } & any>,
  areEqual?: (prevProps: any, nextProps: any) => boolean
) {
  return memo(component, areEqual || ((prev, next) => {
    // Default comparison: compare item.id
    return prev?.item?.id === next?.item?.id;
  }));
}

/**
 * Performance-aware list item wrapper
 * Wraps any component with performance optimizations
 */
export function withPerformanceOptimizations<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const MemoizedComponent = memo(WrappedComponent);

  return (props: P) => {
    return React.createElement(MemoizedComponent, props);
  };
}

// ─── Scroll Performance Utilities ───────────────────────────

/**
 * Debounce scroll events for performance
 */
export function useScrollDebounce(delay: number = 150) {
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<any>(null);

  const onScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // Check if user stopped scrolling
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
        // User has stopped scrolling - can load more content
        return true;
      }
      lastScrollY.current = currentScrollY;
    }, delay);
  }, [delay]);

  return { onScroll };
}

// ─── Image Loading Optimization ───────────────────────────

/**
 * Track image loading performance
 */
export function useImagePerformance() {
  const imageLoadTimes = useRef<Map<string, number>>(new Map());

  const trackImageLoad = useCallback((imageUrl: string, startTime: number) => {
    const loadTime = Date.now() - startTime;
    imageLoadTimes.current.set(imageUrl, loadTime);

    // Log slow images
    if (loadTime > 1000) {
      console.warn(`Slow image detected: ${imageUrl} took ${loadTime}ms`);
    }
  }, []);

  const getAverageLoadTime = useCallback(() => {
    const times = Array.from(imageLoadTimes.current.values());
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }, []);

  return { trackImageLoad, getAverageLoadTime };
}

// ─── Memory Management ───────────────────────────────────

/**
 * Cleanup resources on unmount
 */
export function useCleanup(
  cleanupFn: () => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    return () => {
      cleanupFn();
    };
  }, deps);
}

/**
 * Clear intervals and timeouts on unmount
 */
export function useIntervalCleanup() {
  const intervalsRef = useRef<any[]>([]);
  const timeoutsRef = useRef<any[]>([]);

  const setSafeInterval = useCallback((callback: () => void, delay: number) => {
    const interval = globalThis.setInterval(callback, delay);
    intervalsRef.current.push(interval);
    return interval;
  }, []);

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = globalThis.setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  useCleanup(() => {
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutsRef.current = [];
  });

  return { setInterval: setSafeInterval, setTimeout: setSafeTimeout };
}

// ─── Performance Monitoring ─────────────────────────────

/**
 * Track component render count (for development)
 */
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (__DEV__) {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });
}

/**
 * Track expensive operations
 */
export function usePerformanceTracker(operationName: string) {
  const startTracking = useCallback(() => {
    if (__DEV__) {
      console.log(`[Perf] Starting: ${operationName}`);
      return performance.now();
    }
    return Date.now();
  }, [operationName]);

  const endTracking = useCallback((startTime: number) => {
    if (__DEV__) {
      const duration = Date.now() - startTime;
      console.log(`[Perf] ${operationName} took ${duration}ms`);
      if (duration > 100) {
        console.warn(`[Perf] SLOW OPERATION: ${operationName} took ${duration}ms`);
      }
    }
  }, [operationName]);

  return { startTracking, endTracking };
}
