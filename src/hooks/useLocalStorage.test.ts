import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';
import { onStorageError } from './usePersistedValue';

const KEY = 'test_key';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useLocalStorage', () => {
  it('reads the stored value', () => {
    localStorage.setItem(KEY, JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('saved');
  });

  it('falls back to the default when the normalizer rejects the stored value', () => {
    localStorage.setItem(KEY, JSON.stringify(123));
    const { result } = renderHook(() =>
      useLocalStorage(KEY, 'default', (v) => (typeof v === 'string' ? v : undefined)),
    );
    expect(result.current[0]).toBe('default');
  });

  it('falls back to the default on unparseable JSON', () => {
    localStorage.setItem(KEY, '{broken');
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('does not write back the value it just read', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    renderHook(() => useLocalStorage(KEY, 'default'));
    act(() => vi.advanceTimersByTime(1000));
    window.dispatchEvent(new Event('pagehide'));
    expect(setItem).not.toHaveBeenCalled();
  });

  it('writes changes after the debounce delay', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'a'));
    act(() => result.current[1]('b'));
    expect(localStorage.getItem(KEY)).not.toBe('"b"');
    act(() => vi.advanceTimersByTime(300));
    expect(localStorage.getItem(KEY)).toBe('"b"');
  });

  it('writes a pending change immediately when the page is hidden', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'a'));
    act(() => result.current[1]('b'));
    window.dispatchEvent(new Event('pagehide'));
    expect(localStorage.getItem(KEY)).toBe('"b"');
  });

  it('writes a pending change on unmount', () => {
    const { result, unmount } = renderHook(() => useLocalStorage(KEY, 'a'));
    act(() => result.current[1]('b'));
    unmount();
    expect(localStorage.getItem(KEY)).toBe('"b"');
  });

  it('reports storage errors to listeners', () => {
    const listener = vi.fn();
    const stop = onStorageError(listener);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useLocalStorage(KEY, 'a'));
    act(() => result.current[1]('b'));
    act(() => vi.advanceTimersByTime(300));
    expect(listener).toHaveBeenCalledWith(KEY);
    stop();
  });
});
