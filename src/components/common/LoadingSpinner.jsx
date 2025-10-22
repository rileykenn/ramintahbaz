import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex justify-center items-center h-64">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-black dark:border-white border-t-transparent`}
      />
    </div>
  );
};

export default LoadingSpinner;
