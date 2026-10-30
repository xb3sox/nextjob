import { useCallback, useEffect, useState } from 'react';
import type { TrackedApplication } from './types';

export const APPLICATIONS_STORAGE_KEY = 'nextjob.applications.v1';

export function readApplicationsFromStorage(): TrackedApplication[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeApplicationsToStorage(apps: TrackedApplication[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // Ignore storage write errors (e.g. quota exceeded)
  }
}

export function useApplications(): [
  TrackedApplication[],
  (apps: TrackedApplication[] | ((prev: TrackedApplication[]) => TrackedApplication[])) => void,
] {
  const [applications, setApplications] = useState<TrackedApplication[]>(() =>
    readApplicationsFromStorage()
  );

  useEffect(() => {
    // Listen for storage events across tabs or local changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === APPLICATIONS_STORAGE_KEY) {
        setApplications(readApplicationsFromStorage());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateApplications = useCallback(
    (action: TrackedApplication[] | ((prev: TrackedApplication[]) => TrackedApplication[])) => {
      setApplications((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        writeApplicationsToStorage(next);
        return next;
      });
    },
    []
  );

  return [applications, updateApplications];
}
