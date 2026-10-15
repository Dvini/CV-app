import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { useHistory } from './useHistory';

/** Mirrors how CVDataContext wires the hook: raw setter + trackChange on every edit. */
function useEditableValue(initial: string) {
  const [value, setRaw] = useState(initial);
  const history = useHistory(value, setRaw);
  const edit = (next: string) => {
    history.trackChange(value);
    setRaw(next);
  };
  return { value, edit, ...history };
}

describe('useHistory', () => {
  it('undoes and redoes an edit', () => {
    const { result } = renderHook(() => useEditableValue('a'));
    act(() => result.current.edit('b'));
    act(() => result.current.undo());
    expect(result.current.value).toBe('a');
    act(() => result.current.redo());
    expect(result.current.value).toBe('b');
  });

  it('records the first edit after an undo and drops the redo stack', () => {
    const { result } = renderHook(() => useEditableValue('a'));
    act(() => result.current.edit('b'));
    act(() => result.current.undo());
    act(() => result.current.edit('c'));

    expect(result.current.canRedo).toBe(false);
    act(() => result.current.redo());
    expect(result.current.value).toBe('c');

    act(() => result.current.undo());
    expect(result.current.value).toBe('a');
  });

  it('ignores the duplicate trackChange that StrictMode causes', () => {
    const { result } = renderHook(() => useEditableValue('a'));
    act(() => {
      result.current.trackChange('a');
      result.current.trackChange('a');
    });
    act(() => result.current.undo());
    expect(result.current.canUndo).toBe(false);
  });

  it('clearHistory forgets both stacks', () => {
    const { result } = renderHook(() => useEditableValue('a'));
    act(() => result.current.edit('b'));
    act(() => result.current.edit('c'));
    act(() => result.current.undo());
    act(() => result.current.clearHistory());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
