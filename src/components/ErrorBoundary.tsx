// @ts-nocheck
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
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
            Wystąpił nieoczekiwany błąd w aplikacji. Możesz spróbować odświeżyć stronę lub zresetować dane.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Spróbuj ponownie
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Odśwież stronę
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

