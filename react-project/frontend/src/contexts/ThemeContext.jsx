import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');
        // Check system preference if no saved preference
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return savedTheme === 'dark';
    });

    useEffect(() => {
        // Update localStorage when theme changes
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        // Update document class for global styles
        document.documentElement.classList.toggle('dark-mode', isDarkMode);
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 