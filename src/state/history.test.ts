import { describe, expect, it } from 'vitest';
import { COALESCE_MS, MAX_HISTORY, createHistory, historyReducer, type History } from './history';

const set = (value: string, group?: string, time = 0) =>
  ({ type: 'update', update: () => value, group, time }) as const;

function run(...actions: Parameters<typeof historyReducer<string>>[1][]): History<string> {
  return actions.reduce(historyReducer<string>, createHistory('a'));
}

describe('historyReducer', () => {
  it('undoes and redoes an update', () => {
    const edited = run(set('b'));
    const undone = historyReducer(edited, { type: 'undo' });
    expect(undone.present).toBe('a');
    expect(historyReducer(undone, { type: 'redo' }).present).toBe('b');
  });

  it('records the first update after an undo and drops the redo stack', () => {
    const state = run(set('b'), { type: 'undo' }, set('c'));
    expect(state.future).toEqual([]);
    expect(historyReducer(state, { type: 'redo' }).present).toBe('c');
    expect(historyReducer(state, { type: 'undo' }).present).toBe('a');
  });

  it('ignores updates that return the same state', () => {
    const state = run({ type: 'update', update: (s) => s, time: 0 });
    expect(state.past).toEqual([]);
  });

  it('merges quick updates of the same group into one step', () => {
    const state = run(set('ab', 'name', 0), set('abc', 'name', 100), set('abcd', 'name', 100 + COALESCE_MS - 1));
    expect(state.present).toBe('abcd');
    expect(state.past).toEqual(['a']);
  });

  it('starts a new step after a pause, or for a different group', () => {
    expect(run(set('ab', 'name', 0), set('abc', 'name', COALESCE_MS)).past).toEqual(['a', 'ab']);
    expect(run(set('ab', 'name', 0), set('abc', 'title', 10)).past).toEqual(['a', 'ab']);
    expect(run(set('ab', undefined, 0), set('abc', undefined, 10)).past).toEqual(['a', 'ab']);
  });

  it('does not merge into a step that was undone and redone', () => {
    const state = run(set('b', 'name', 0), { type: 'undo' }, { type: 'redo' }, set('c', 'name', 10));
    expect(state.past).toEqual(['a', 'b']);
  });

  it(`keeps at most ${MAX_HISTORY} steps`, () => {
    const actions = Array.from({ length: MAX_HISTORY + 5 }, (_, i) => set(`v${i}`));
    const state = run(...actions);
    expect(state.past).toHaveLength(MAX_HISTORY);
    expect(state.past[0]).toBe('v4');
  });

  it('reset replaces the state and forgets history', () => {
    const state = historyReducer(run(set('b'), set('c'), { type: 'undo' }), { type: 'reset', present: 'z' });
    expect(state).toEqual(createHistory('z'));
  });
});
