import React from 'react';
import useWindowResize from '../../hooks/useWindowResize';
import Navbar from './Navbar';

const PageLayoutWorkSingle = ({ children }) => {
  const { baseUnit } = useWindowResize();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-[#1c1f26]">
      {/* CHANGED: removed mx-auto to stop centering */}
      <div className="w-full max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <Navbar />
        <main
          className="mt-8 text-black dark:text-white"
          style={{ '--base-unit': `${baseUnit}px` }}
        >
          <div className="flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayoutWorkSingle;
