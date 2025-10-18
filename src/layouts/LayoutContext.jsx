import React, { createContext, useContext, useState, useEffect } from 'react'; 

/**
 * @description
 * Provides a global layout context for managing sidebar visibility and responsiveness.
 * Automatically detects mobile/desktop viewport changes, syncs sidebar state with localStorage,
 * and updates the DOM classes to reflect transitions.
 * 
 * @module LayoutContext
 * 
 * React Context for layout and sidebar state management.
 * @type {React.Context<Object>}
 */
const LayoutContext = createContext();

/**
 * Custom hook for accessing the Layout Context.
 * Ensures that components can only access layout state within a LayoutProvider.
 * 
 * @returns {Object} Layout context value containing state and actions.
 * @throws {Error} If called outside of a LayoutProvider.
 */
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

/**
 * Provider component that manages layout-related state and makes it available
 * to all child components via React Context.
 
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components that consume layout context.
 * @returns {JSX.Element} The provider component wrapping all children.
 */
export const LayoutProvider = ({ children }) => {
  /** @type {[boolean, Function]} Sidebar visibility state. */
  /** @type {[boolean, Function]} Indicates whether the current view is mobile. */
  /** @type {[boolean, Function]} Marks whether initialization logic has completed. */
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

   /**
   * Updates the DOM sidebar element's CSS classes to reflect visibility transitions.
   * Adds/removes animation and display classes based on open/close state.
   * 
   * @param {boolean} isOpen - Whether the sidebar should be visible.
   */
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