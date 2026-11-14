import { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext(null);

// ModeProvider manages Innie / Outie state across the app
export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('mode') || 'outie';
  });

  // Apply or remove the .innie class and .dark class on <html> whenever mode changes
  useEffect(() => {
    if (mode === 'innie') {
      document.documentElement.classList.add('innie');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('innie');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('mode', mode);
  }, [mode]);

  // Toggle between outie and innie modes
  const toggleMode = () => {
    setMode((prev) => (prev === 'outie' ? 'innie' : 'outie'));
  };

  const isInnie = mode === 'innie';

  return (
    <ModeContext.Provider value={{ mode, isInnie, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

// Custom hook to use ModeContext
export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
