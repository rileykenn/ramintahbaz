import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import sunIcon from '../../assets/images/sun.svg';
import moonIcon from '../../assets/images/moon.svg';

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav>
      <div className="flex justify-between items-center">
        <Link to="/" className={`text-[16px] md:text-[16pt] dark:text-white text-black`}>
          Ramin Tahbaz
        </Link>
        {isHome && (
          <button
            onClick={toggleDarkMode}
            className="p-[5px] rounded-full bg-gray-200 dark:bg-gray-700 relative right-[15px]"
            aria-label="Toggle theme"
          >
            <img 
              src={isDarkMode ? moonIcon : sunIcon} 
              alt={isDarkMode ? "Dark mode" : "Light mode"}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;