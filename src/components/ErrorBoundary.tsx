import React from 'react';
import { ACTIVE_CV_STORAGE_KEYS, readStoredSnapshot } from '../state/cvDocument';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Downloads the active CV in the JSON import format (so it can be re-imported, which
 * also repairs malformed fields), plus every raw `cv_*` entry for manual recovery.
 */
function downloadBackup() {
  const backup = readStoredSnapshot();

  const raw: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('cv_')) raw[key] = localStorage.getItem(key);
  }
  backup._raw = raw;

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CV_kopia_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetActiveCV() {
  if (!window.confirm('Usunąć dane bieżącego CV? Pozostałe profile zostaną zachowane. Najpierw warto pobrać kopię.')) {
    return;
  }
  // Removing only the active CV's keys keeps the other profiles
  ACTIVE_CV_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  window.location.reload();
}

const buttonStyle: React.CSSProperties = {
  padding: '0.625rem 1.25rem',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  background: '#ffffff',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center',
          background: '#f8fafc',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Coś poszło nie tak
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: 480 }}>
            Wystąpił nieoczekiwany błąd w aplikacji. Spróbuj ponownie. Jeśli błąd się powtarza,
            pobierz kopię danych i zresetuj bieżące CV — kopię możesz potem wczytać przyciskiem „Wgraj JSON”.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={this.handleReset} style={buttonStyle}>
              Spróbuj ponownie
            </button>
            <button onClick={downloadBackup} style={buttonStyle}>
              Pobierz kopię danych
            </button>
            <button
              onClick={resetActiveCV}
              style={{ ...buttonStyle, border: 'none', background: '#dc2626', color: '#ffffff' }}
            >
              Resetuj bieżące CV
            </button>
          </div>
          {this.state.error && (
            <details style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.75rem', maxWidth: 600 }}>
              <summary style={{ cursor: 'pointer' }}>Szczegóły błędu</summary>
              <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '0.5rem' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
