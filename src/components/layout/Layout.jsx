import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen overflow-hidden bg-white dark:bg-[#1c1f26]">
      <div className="p-10 md:p-20 w-full md:max-w-[570px]">
        <Navbar />
        <main className="mt-12 text-black dark:text-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;