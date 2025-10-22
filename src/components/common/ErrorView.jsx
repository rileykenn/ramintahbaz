import React from 'react';

const ErrorView = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-black dark:text-white">
      <p className="text-[1rem] mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[16pt] hover:text-[#6366f1] dark:text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorView;