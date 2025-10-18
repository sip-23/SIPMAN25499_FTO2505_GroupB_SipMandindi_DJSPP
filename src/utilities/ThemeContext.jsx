import React, { createContext, useContext, useState, useEffect } from 'react'; 

const ThemeContext = createContext();

/**
 * Context providing theme state (light/dark mode) and toggle function.
 *
 * @typedef {Object} ThemeContextValue
 * @property {boolean} darkMode - Whether dark mode is currently enabled.
 * @property {function(): void} toggleTheme - Function to toggle between light and dark mode.

 * React hook to access theme state and toggle function.
 *
 * Must be used within a ThemeProvider.
 *
 * @function
 * @returns {ThemeContextValue} - The current theme context value.
 *
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


/**
 * ThemeProvider component to manage and provide theme state.
 * Handles initialization from localStorage or system preference,
 * applies theme to the document body, and provides a toggle function.
 *
 * @function
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components wrapped by the provider.
 */
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('darkMode');
      
      if (savedTheme === 'enabled') {
        setDarkMode(true);
        document.body.classList.add('dark');
      } else if (savedTheme === 'disabled') {
        setDarkMode(false);
        document.body.classList.remove('dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Only use system preference if no user preference is saved
        setDarkMode(true);
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
      }
    };

    initializeTheme();
  }, []);

  /**
   * Toggles between dark and light mode.
   * Updates the document body class and persists preference in localStorage.
   *
   */
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'disabled');
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};