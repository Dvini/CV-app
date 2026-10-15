import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
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
