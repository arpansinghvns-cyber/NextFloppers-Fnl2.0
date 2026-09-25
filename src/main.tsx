import { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Root Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#070709',
          color: '#e5e5e5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            padding: '32px',
            backgroundColor: '#121218',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h1 style={{ color: '#FACC15', fontSize: '22px', fontWeight: '900', marginBottom: '8px', letterSpacing: '0.05em' }}>
              NEXT FLOPPERS
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
              Application initialization recovered from an unexpected state. Click below to refresh your session.
            </p>
            {this.state.error && (
              <pre style={{
                color: '#f87171',
                fontSize: '11px',
                background: '#09090d',
                padding: '12px',
                borderRadius: '10px',
                overflowX: 'auto',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('flopper_flow_mode');
                  sessionStorage.clear();
                } catch {}
                window.location.reload();
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: '#FACC15',
                color: '#000000',
                fontWeight: '800',
                fontSize: '13px',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              Reload Next Floppers
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
}
