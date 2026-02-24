/**
 * Global Loading State Management
 * Provides a consistent loading experience across the app
 */

import { useState, useCallback } from 'react';
import { useMedinaStore } from '@/store/useMedinaStore';

export interface LoadingState {
  [key: string]: boolean;
}

// ─── Hook: Global Loading Manager ────────────────────────
export function useGlobalLoading() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const startLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some((state) => state);
  }, [loadingStates]);

  return {
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
  };
}

// ─── Hook: Async Operation Wrapper ───────────────────────
interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const { onSuccess, onError, onComplete } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        onSuccess?.();
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        onError?.(errorObj);
        return null;
      } finally {
        setIsLoading(false);
        onComplete?.();
      }
    },
    [onSuccess, onError, onComplete]
  );

  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

// ─── Hook: Data Fetching with Loading State ───────────────
export function useDataFetcher<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  // Auto-fetch on mount
  // Uncomment if you want automatic data fetching
  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    fetchData,
    setData,
  };
}

// ─── Hook: Refresh Control ───────────────────────────────
export function useRefreshControl() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async (refreshFn: () => Promise<void>) => {
    setRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    refreshing,
    onRefresh,
    setRefreshing,
  };
}

// ─── Utility: Debounce Function ─────────────────────────
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  // Implementation will be added when needed
  return callback;
}

// ─── Utility: Throttle Function ─────────────────────────
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  // Implementation will be added when needed
  return callback;
}
