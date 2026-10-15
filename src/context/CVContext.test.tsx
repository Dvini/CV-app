import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CVProvider } from './CVContext';
import { useCVAppearance, useCVData, useCVManager } from './hooks';
import { DEFAULT_SNAPSHOT } from '../constants/defaults';

function useCV() {
  return { cv: useCVData(), look: useCVAppearance(), manager: useCVManager() };
}

const wrapper = ({ children }: { children: React.ReactNode }) => <CVProvider>{children}</CVProvider>;

const jsonFile = (content: unknown) =>
  new File([typeof content === 'string' ? content : JSON.stringify(content)], 'cv.json', {
    type: 'application/json',
  });

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('undo', () => {
  it('covers appearance and section order, not just content', () => {
    const { result } = renderHook(useCV, { wrapper });
    const initialOrder = result.current.cv.sectionOrder;

    act(() => result.current.look.setTemplate('creative'));
    act(() => result.current.cv.moveSection('experience', 'down'));
    expect(result.current.cv.sectionOrder).not.toEqual(initialOrder);

    act(() => result.current.cv.undo());
    expect(result.current.cv.sectionOrder).toEqual(initialOrder);
    act(() => result.current.cv.undo());
    expect(result.current.look.template).toBe('classic');
  });

  it('undoes typing in one field as a single step', () => {
    vi.useFakeTimers(); // freezes Date.now, so all keystrokes fall in one coalescing window
    const { result } = renderHook(useCV, { wrapper });
    for (const name of ['A', 'An', 'Ann']) {
      act(() => result.current.cv.handlePersonalChange('fullName', name));
    }
    act(() => result.current.cv.handlePersonalChange('title', 'Dev'));

    act(() => result.current.cv.undo());
    expect(result.current.cv.data.personal.fullName).toBe('Ann');
    act(() => result.current.cv.undo());
    expect(result.current.cv.data.personal.fullName).toBe(DEFAULT_SNAPSHOT.data.personal.fullName);
    expect(result.current.cv.canUndo).toBe(false);
  });
});

describe('section layout', () => {
  it.each(['twocolumn', 'creative'] as const)('moves sections within their own column in %s', (template) => {
    const { result } = renderHook(useCV, { wrapper });
    act(() => result.current.look.setTemplate(template));
    // Default order: personal, experience, education (side), courses, ...
    expect(result.current.cv.isFirstInColumn('education')).toBe(true);

    act(() => result.current.cv.moveSection('courses', 'up'));
    const order = result.current.cv.sectionOrder;
    // Swapped with the previous main-column section, skipping the side-column "education"
    expect(order.indexOf('courses')).toBeLessThan(order.indexOf('experience'));
    expect(order.indexOf('education')).toBe(DEFAULT_SNAPSHOT.sectionOrder.indexOf('education'));
  });

  it('moves sections across the whole list in single-column templates', () => {
    const { result } = renderHook(useCV, { wrapper });
    act(() => result.current.cv.moveSection('courses', 'up'));
    const order = result.current.cv.sectionOrder;
    expect(order.indexOf('courses')).toBeLessThan(order.indexOf('education'));
  });
});

describe('storage', () => {
  it('migrates legacy appearance keys and removes them once the combined key is saved', () => {
    vi.useFakeTimers();
    localStorage.setItem('cv_template', '"compact"');
    localStorage.setItem('cv_twoColSidebarWidth', '40');
    const { result } = renderHook(useCV, { wrapper });
    expect(result.current.look.template).toBe('compact');
    expect(result.current.look.twoColSidebarWidth).toBe(40);

    act(() => result.current.look.setThemeColor('#000000'));
    act(() => vi.advanceTimersByTime(300));

    const saved = JSON.parse(localStorage.getItem('cv_appearance')!);
    expect(saved).toMatchObject({ template: 'compact', twoColSidebarWidth: 40, themeColor: '#000000' });
    expect(localStorage.getItem('cv_template')).toBeNull();
    expect(localStorage.getItem('cv_twoColSidebarWidth')).toBeNull();
  });

  it('does not write anything on startup', () => {
    vi.useFakeTimers();
    renderHook(useCV, { wrapper });
    act(() => vi.advanceTimersByTime(1000));
    expect(localStorage.length).toBe(0);
  });
});

describe('profiles', () => {
  it('keep their own data and two-column settings', () => {
    const { result } = renderHook(useCV, { wrapper });

    act(() => result.current.look.setTwoColSidebarWidth(45));
    act(() => result.current.cv.handlePersonalChange('fullName', 'Ewa'));

    act(() => result.current.manager.createProfile('Profil 2'));
    expect(result.current.look.twoColSidebarWidth).toBe(DEFAULT_SNAPSHOT.twoColSidebarWidth);
    expect(result.current.cv.data.personal.fullName).toBe(DEFAULT_SNAPSHOT.data.personal.fullName);
    act(() => result.current.look.setTwoColSidebarWidth(25));
    const secondId = result.current.manager.activeProfileId;

    act(() => result.current.manager.switchProfile('default'));
    expect(result.current.look.twoColSidebarWidth).toBe(45);
    expect(result.current.cv.data.personal.fullName).toBe('Ewa');

    act(() => result.current.manager.switchProfile(secondId));
    expect(result.current.look.twoColSidebarWidth).toBe(25);
  });

  it('do not leak into each other through undo', () => {
    const { result } = renderHook(useCV, { wrapper });
    act(() => result.current.cv.handlePersonalChange('fullName', 'Ewa'));
    act(() => result.current.manager.createProfile('Profil 2'));

    expect(result.current.cv.canUndo).toBe(false);
    act(() => result.current.cv.undo());
    expect(result.current.cv.data.personal.fullName).toBe(DEFAULT_SNAPSHOT.data.personal.fullName);
  });
});

describe('importJSON', () => {
  it('reports invalid files without changing the CV', async () => {
    const { result } = renderHook(useCV, { wrapper });
    act(() => result.current.cv.handlePersonalChange('fullName', 'Ewa'));

    let error: string | null = null;
    await act(async () => {
      error = await result.current.manager.importJSON(jsonFile('{oops'));
    });
    expect(error).toBe('To nie jest poprawny plik JSON.');
    expect(result.current.cv.data.personal.fullName).toBe('Ewa');
  });

  it('applies a valid file and starts a fresh undo history', async () => {
    const { result } = renderHook(useCV, { wrapper });
    act(() => result.current.cv.handlePersonalChange('fullName', 'Ewa'));

    let error: string | null = 'not run';
    await act(async () => {
      error = await result.current.manager.importJSON(
        jsonFile({ data: { personal: { fullName: 'Import' } }, twoColSidebarWidth: 40 }),
      );
    });
    expect(error).toBeNull();
    expect(result.current.cv.data.personal.fullName).toBe('Import');
    expect(result.current.look.twoColSidebarWidth).toBe(40);
    expect(result.current.cv.canUndo).toBe(false);
  });
});

describe('resetToDefaults', () => {
  it('restores every appearance setting', () => {
    const { result } = renderHook(useCV, { wrapper });
    act(() => {
      result.current.look.setTwoColSidebarWidth(45);
      result.current.look.setShowContactIcons(true);
      result.current.look.setTemplate('creative');
    });
    act(() => result.current.manager.resetToDefaults());
    expect(result.current.look.twoColSidebarWidth).toBe(DEFAULT_SNAPSHOT.twoColSidebarWidth);
    expect(result.current.look.showContactIcons).toBe(false);
    expect(result.current.look.template).toBe('classic');
  });
});
