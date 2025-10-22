import React from 'react';
import useWindowResize from '../../hooks/useWindowResize';
import Navbar from './Navbar';

const PageLayoutWorkSingle = ({ children }) => {
  const { baseUnit } = useWindowResize();

  return (
    <div className={`min-h-screen overflow-hidden dark:bg-dark-bg bg-white-bg`}>
      <div className="p-8 md:p-20 w-full md:max-w-[65%]">
        <Navbar />
        <main className={`mt-8 dark:text-dark-text text-light-text`}>
          <div
            className="flex flex-col"
            style={{
              '--base-unit': `${baseUnit}px`,
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayoutWorkSingle;