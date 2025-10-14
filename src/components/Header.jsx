import { IoBookOutline, IoNotificationsOutline, IoSearchOutline, IoPersonOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { IMAGES } from "../data/images";

/**
 * Header Component
 *
 * A fixed top navigation bar
 * @component
 */
const Header = ({ onSearch, searchTerm, onToggleSidebar }) => {
    const [searchValue, setSearchValue] = useState(searchTerm || "");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);


    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            if (onSearch) {
                onSearch(value.toLowerCase().trim());
            }
        }, 300);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            
            // Execute search immediately
            if (onSearch) {
                onSearch(searchValue.toLowerCase().trim());
            }
        }
    }

    const clearSearch = () => {
        setSearchValue("");
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (onSearch) {
            onSearch("");
        }
    };

    const toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        const newState = !isSidebarOpen;
        
        if (sidebar) {
            if (newState) {
                sidebar.classList.remove('sidebar-hidden');
                sidebar.classList.add('sidebar-visible', 'block');
                sidebar.classList.remove('hidden');
            } else {
                sidebar.classList.remove('sidebar-visible');
                sidebar.classList.add('sidebar-hidden');
                // Add hidden class after transition
                setTimeout(() => {
                    sidebar.classList.add('hidden');
                }, 300);
            }
            
            // Update lock icons
            const openLock = document.getElementById('open-lock');
            const closedLock = document.getElementById('closed-lock');
            if (openLock && closedLock) {
                if (newState) {
                    openLock.classList.add('hidden');
                    closedLock.classList.remove('hidden');
                } else {
                    openLock.classList.remove('hidden');
                    closedLock.classList.add('hidden');
                }
            }
            
            setIsSidebarOpen(newState);
            
            // Notify parent component about sidebar state change
            if (onToggleSidebar) {
                onToggleSidebar(newState);
            }
        }
    };

    useEffect(() => {
        setSearchValue(searchTerm || "");
    }, [searchTerm]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Initialize sidebar state
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const isCurrentlyOpen = !sidebar.classList.contains('hidden');
            setIsSidebarOpen(isCurrentlyOpen);
            
            // Set initial classes for transition
            if (isCurrentlyOpen) {
                sidebar.classList.add('sidebar-visible');
            } else {
                sidebar.classList.add('sidebar-hidden');
            }
            
            // Set initial lock state
            const openLock = document.getElementById('open-lock');
            const closedLock = document.getElementById('closed-lock');
            if (openLock && closedLock) {
                if (isCurrentlyOpen) {
                    openLock.classList.add('hidden');
                    closedLock.classList.remove('hidden');
                } else {
                    openLock.classList.remove('hidden');
                    closedLock.classList.add('hidden');
                }
            }
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="top-0 left-0 right-0 bg-[#121212] w-full h-fit px-5 py-2 relative flex-1 flex items-center justify-between z-50 border-b border-[#333]">

            <div className="flex items-center gap-4">
                {/* Menu Toggle and Lock Icons */}
                <div className="flex items-center gap-2">
                    {/* Open Lock Icon (Sidebar Closed) */}
                    <svg 
                        id="open-lock" 
                        className="ml-1 md:ml-6 fill-[#000] dark:fill-[#b3b3b3] cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="22" 
                        height="22" 
                        viewBox="0 0 56 56"
                        onClick={toggleSidebar}
                    >
                        <path d="M 40.3163 3.2969 C 33.7070 3.2969 27.3320 7.8438 27.3320 17.5234 L 27.3320 24.9063 L 7.2460 24.9063 C 4.1288 24.9063 2.6757 26.3828 2.6757 29.7344 L 2.6757 47.8750 C 2.6757 51.2266 4.1288 52.7031 7.2460 52.7031 L 30.8242 52.7031 C 33.9413 52.7031 35.3944 51.2266 35.3944 47.8750 L 35.3944 29.7344 C 35.3944 26.5000 34.0351 25.0234 31.1054 24.9297 L 31.1054 17.0313 C 31.1054 10.3750 35.4179 6.8828 40.3163 6.8828 C 45.2382 6.8828 49.5505 10.3750 49.5505 17.0313 L 49.5505 22.4219 C 49.5505 24.0860 50.3708 24.7891 51.4489 24.7891 C 52.4804 24.7891 53.3243 24.1563 53.3243 22.4922 L 53.3243 17.5234 C 53.3243 7.8438 46.9259 3.2969 40.3163 3.2969 Z"/>
                    </svg>
                    
                    {/* Closed Lock Icon (Sidebar Open) */}
                    <svg 
                        id="closed-lock" 
                        className="hidden ml-1 md:ml-6 fill-[#000] dark:fill-[#b3b3b3] cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" 
                        xmlnsXlink="http://www.w3.org/1999/xlink" 
                        width="22" 
                        height="22" 
                        viewBox="0 0 94.666 94.666" 
                        xmlSpace="preserve"
                        onClick={toggleSidebar}
                    >
                        <g>
                            <path d="M76.923,35.406h-3.128v-8.945C73.795,11.871,61.924,0,47.333,0S20.871,11.871,20.871,26.461v8.945h-3.128c-1.104,0-2,0.896-2,2v55.26c0,1.104,0.896,2,2,2h59.18c1.104,0,2-0.896,2-2v-55.26C78.923,36.302,78.028,35.406,76.923,35.406zM47.333,11.181c8.426,0,15.281,6.854,15.281,15.28v8.945H32.052v-8.945C32.052,18.036,38.907,11.181,47.333,11.181z"/>
                        </g>
                    </svg>

                    {/* Menu Button */}
                    <button 
                        id="open-menu-btn" 
                        className="transition-colors hover:fill-[#b3b3b3] fill-[#000] dark:fill-[#b3b3b3]"
                        onClick={toggleSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                            <g>
                                <path d="m 1 2 h 14 v 2 h -14 z m 0 0"/>
                                <path d="m 1 7 h 14 v 2 h -14 z m 0 0"/>
                                <path d="m 1 12 h 14 v 2 h -14 z m 0 0"/>
                            </g>
                        </svg>
                    </button>
                </div>

                {/* Icon Container */}
                <div className="flex items-center">
                    {IMAGES.LOGO && (
                        <img 
                            className="flex w-[200px] h-12 md:w-[170px]" 
                            src={IMAGES.DARKLOGO} 
                            alt="Dark mode logo"
                        />
                    )}
                </div>
            </div>
            
            
            {/* Search container */}
            <div className="flex items-center w-[350px] h-10 px-3">
                <IoSearchOutline color="#b3b3b3" className=" mr-3" size={22}/>
                <input
                    ref={searchInputRef} 
                    type="text" 
                    placeholder="Search" 
                    value={searchValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyPress}
                    className="border rounded-md opacity-30 bg-[#121212] w-full py-2 px-4 placeholder:text-[#b3b3b3] text-white hover:border-[#9A7B4F]" 
                />

                {/* Adding Clear search button */}
                {searchValue && (
                    <button 
                        onClick={clearSearch}
                        className="ml-2 text-[#b3b3b3] hover:text-white transition-colors"
                        title="Clear search">
                        ×
                    </button>
                )}
            </div>
            
            {/* Icons container */}
            <div className="flex items-center justify-center">
                <div className="hidden md:block rounded-full w-10 h-10 bg-[#65350F] grid place-items-center cursor-pointer hover:bg-[#9A7B4F] mr-3 p-2">
                    <IoNotificationsOutline color="#b3b3b3" size={22}/>
                </div>
                <div className="hidden md:flex rounded-full w-10 h-10 bg-[#65350F] grid place-items-center cursor-pointer hover:bg-[#9A7B4F] mr-3 p-2">
                    <IoBookOutline color="#b3b3b3" size={22} />
                </div>
                <div className="rounded-full w-10 h-10 bg-[#65350F] grid place-items-center cursor-pointer hover:bg-[#9A7B4F] mr-3">
                    <IoPersonOutline color="#b3b3b3" size={22} />
                </div>
            </div>
        </div>
    );
};

export default Header;