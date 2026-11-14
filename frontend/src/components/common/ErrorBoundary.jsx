import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('TraceBack ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    // Clear potentially corrupted localStorage
    localStorage.removeItem('traceback_items');
    localStorage.removeItem('traceback_matches');
    localStorage.removeItem('traceback_claims');
    localStorage.removeItem('traceback_disputes');
    localStorage.removeItem('traceback_users');
    localStorage.removeItem('traceback_notifications');
    localStorage.removeItem('traceback_auth_user');
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F4F0E3',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#FAF8F3',
            border: '1px solid #E6DFC9',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 14px -2px rgba(48,47,37,0.06)',
          }}>
            <h1 style={{ color: '#4B5035', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#4C4B3D', fontSize: '0.875rem', marginBottom: '1rem' }}>
              TraceBack encountered an unexpected error. This may be caused by cached data or a temporary issue.
            </p>
            <pre style={{
              background: '#302F25',
              color: '#E6DFC9',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              maxHeight: '160px',
              marginBottom: '1rem',
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack?.slice(0, 500)}
            </pre>
            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#B96F4B',
                color: '#fff',
                border: 'none',
                borderRadius: '0.625rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
