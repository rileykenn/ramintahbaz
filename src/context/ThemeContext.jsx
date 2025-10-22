import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme);
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
        localStorage.setItem('darkMode', !isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);