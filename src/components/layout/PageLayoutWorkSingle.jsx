import React from 'react';
import useWindowResize from '../../hooks/useWindowResize';
import Navbar from './Navbar';

const PageLayoutWorkSingle = ({ children }) => {
  const { baseUnit } = useWindowResize();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-[#1c1f26]">
      <div className="mx-auto w-full px-6 sm:px-8 lg:px-12 max-w-[1400px]">
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
