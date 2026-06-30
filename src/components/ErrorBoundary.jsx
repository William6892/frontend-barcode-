import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-app)',
          padding: '20px',
          fontFamily: "'Outfit', sans-serif"
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={32} />
            </div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.75rem'
            }}>
              Algo salió mal
            </h1>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              El sistema experimentó un error inesperado al procesar la vista. Por favor, intenta recargar la página.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--border-glass-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                overflowX: 'auto',
                maxHeight: '150px'
              }}>
                <code style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'var(--color-danger)'
                }}>
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={18} />
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
