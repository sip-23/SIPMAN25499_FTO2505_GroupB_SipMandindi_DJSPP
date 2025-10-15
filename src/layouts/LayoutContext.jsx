import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setIsSidebarOpen(JSON.parse(savedSidebarState));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    
    // Update DOM classes for transitions
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (newState) {
        sidebar.classList.remove('sidebar-hidden', 'hidden');
        sidebar.classList.add('sidebar-visible', 'block');
      } else {
        sidebar.classList.remove('sidebar-visible', 'block');
        sidebar.classList.add('sidebar-hidden');
        setTimeout(() => {
          sidebar.classList.add('hidden');
        }, 300);
      }
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
    setIsSidebarOpen(false);
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('sidebar-visible', 'block');
      sidebar.classList.add('sidebar-hidden');
      setTimeout(() => {
        sidebar.classList.add('hidden');
      }, 300);
    }
  };

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
    setIsSidebarOpen(true);
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('sidebar-hidden', 'hidden');
      sidebar.classList.add('sidebar-visible', 'block');
    }
  };

  return (
    <LayoutContext.Provider value={{
      isSidebarOpen,
      isMobileSidebarOpen,
      toggleSidebar,
      closeMobileSidebar,
      openMobileSidebar
    }}>
      {children}
    </LayoutContext.Provider>
  );
};