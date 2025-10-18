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
  const [isInitialized, setIsInitialized] = useState(false);

  // Single source of truth for sidebar state
  useEffect(() => {
    const checkMobileView = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      const previousMobileView = isMobileView;
      setIsMobileView(mobile);
      
      // On mobile, use saved state or default to open
      if (previousMobileView !== mobile) {
        if (mobile) {
          const savedSidebarState = localStorage.getItem('sidebarOpen');
            if (savedSidebarState !== null) {
              setIsSidebarOpen(JSON.parse(savedSidebarState));
            } else {
              setIsSidebarOpen(false)
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

    if (!isInitialized) {
        setIsInitialized(true);

        if (mobile) {
          const savedSidebarState = localStorage.getItem('sidebarOpen');
          if (savedSidebarState !== null) {
            setIsSidebarOpen(JSON.parse(savedSidebarState));
          } else {
            setIsSidebarOpen(false);
          }
        } else {
          // Desktop: use saved state or default to open
          const savedSidebarState = localStorage.getItem('sidebarOpen');
          if (savedSidebarState !== null) {
            setIsSidebarOpen(JSON.parse(savedSidebarState));
          } else {
            setIsSidebarOpen(true);
          }
        }
      }
    };

    // Initial check
    checkMobileView();

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobileView, 100);
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobileView, isInitialized]);

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


  // Save sidebar state to localStorage (only for desktop)
  useEffect(() => {
    if (isInitialized && !isMobileView) {
      localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen, isMobileView, isInitialized]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    console.log('Toggling sidebar from', isSidebarOpen, 'to', newState, 'on', isMobileView ? 'mobile' : 'desktop');
    setIsSidebarOpen(newState);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (isInitialized) {
      console.log('Sidebar State Update:', {
        isSidebarOpen,
        isMobileView,
        device: isMobileView ? 'mobile/tablet' : 'desktop'
      });
    }
  }, [isSidebarOpen, isMobileView, isInitialized]);

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