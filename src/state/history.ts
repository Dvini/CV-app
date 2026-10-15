/**
 * Generic undo/redo history as a pure reducer.
 *
 * Consecutive updates with the same `group` within COALESCE_MS are merged into a
 * single undo step, so typing in one field or dragging one slider undoes at once.
 */

export const MAX_HISTORY = 50;
export const COALESCE_MS = 500;

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  /** Group of the last update, used for coalescing; null after undo/redo/reset. */
  group: string | null;
  /** Timestamp of the last update in the current group. */
  time: number;
}

export type HistoryAction<T> =
  | { type: 'update'; update: (present: T) => T; group?: string; time: number }
  | { type: 'undo' }
  | { type: 'redo' }
  /** Replaces the state and forgets all history (profile switch, import, reset). */
  | { type: 'reset'; present: T };

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [], group: null, time: 0 };
}

export function historyReducer<T>(state: History<T>, action: HistoryAction<T>): History<T> {
  switch (action.type) {
    case 'update': {
      const next = action.update(state.present);
      if (next === state.present) return state;
      const group = action.group ?? null;
      if (group !== null && group === state.group && action.time - state.time < COALESCE_MS) {
        return { ...state, present: next, time: action.time };
      }
      return {
        past: [...state.past, state.present].slice(-MAX_HISTORY),
        present: next,
        future: [],
        group,
        time: action.time,
      };
    }
    case 'undo': {
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
        group: null,
        time: 0,
      };
    }
    case 'redo': {
      if (state.future.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
        group: null,
        time: 0,
      };
    }
    case 'reset':
      return createHistory(action.present);
  }
}
