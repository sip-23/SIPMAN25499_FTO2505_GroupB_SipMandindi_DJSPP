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
  const [isMobileView, setIsMobileView] = useState(false);

  // Single source of truth for sidebar state
  useEffect(() => {
    const checkMobileView = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobileView(mobile);
      
      // On mobile, use saved state or default to open
      if (mobile) {
        const savedSidebarState = localStorage.getItem('sidebarOpen');
        if (savedSidebarState !== null) {
          setIsSidebarOpen(JSON.parse(savedSidebarState));
        }
      } else {
        // On desktop, use saved state or default to open
        const savedSidebarState = localStorage.getItem('sidebarOpen');
        if (savedSidebarState !== null) {
          setIsSidebarOpen(JSON.parse(savedSidebarState));
        } else {
          setIsSidebarOpen(true); // Default to open on desktop
        }
      }
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener('resize', checkMobileView);

    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  // Save sidebar state to localStorage (only for desktop)
  useEffect(() => {
    if (!isMobileView) {
      localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen, isMobileView]);

  // Update DOM when sidebar state changes
  useEffect(() => {
    updateSidebarDOM(isSidebarOpen);
  }, [isSidebarOpen]);

  const updateSidebarDOM = (isOpen) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (isOpen) {
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

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <LayoutContext.Provider value={{
      isSidebarOpen,
      isMobileView,
      toggleSidebar,
      openSidebar,
      closeSidebar
    }}>
      {children}
    </LayoutContext.Provider>
  );
};