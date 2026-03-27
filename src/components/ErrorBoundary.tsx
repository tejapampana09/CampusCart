import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="glass-dark p-8 rounded-3xl max-w-md">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
        <p className="text-slate-400 mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          className="btn-primary w-full"
          onClick={resetErrorBoundary}
        >
          Reload Application
        </button>
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
