import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ message = 'An error occurred', retry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-4">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
