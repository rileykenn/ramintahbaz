import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
      <h3 className="text-red-600 font-medium mb-2">Something went wrong</h3>
      <p className="text-red-500 mb-4">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorFallback;