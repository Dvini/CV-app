/**
 * Context objects and their hooks, kept apart from the provider components
 * so that React Fast Refresh can hot-reload the providers.
 */
import { createContext, useContext } from 'react';
import type {
  CVAppearanceContextType,
  CVDataContextType,
  CVManagerContextType,
} from '../types/cv';

export const CVDataContext = createContext<CVDataContextType | null>(null);
export const CVAppearanceContext = createContext<CVAppearanceContextType | null>(null);
export const CVManagerContext = createContext<CVManagerContextType | null>(null);

export function useCVData(): CVDataContextType {
  const ctx = useContext(CVDataContext);
  if (!ctx) throw new Error('useCVData must be used within CVProvider');
  return ctx;
}

export function useCVAppearance(): CVAppearanceContextType {
  const ctx = useContext(CVAppearanceContext);
  if (!ctx) throw new Error('useCVAppearance must be used within CVProvider');
  return ctx;
}

export function useCVManager(): CVManagerContextType {
  const ctx = useContext(CVManagerContext);
  if (!ctx) throw new Error('useCVManager must be used within CVProvider');
  return ctx;
}
