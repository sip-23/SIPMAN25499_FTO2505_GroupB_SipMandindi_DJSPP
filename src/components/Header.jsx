import { IoBookOutline, IoNotificationsOutline, IoSearchOutline, IoPersonOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { IMAGES } from "../data/images";
import { useLayout } from "../layouts/LayoutContext.jsx";
import { useTheme } from "../utilities/ThemeContext";

/**
 * Header Component
 * Top navigation bar
 * 
 * @param {Object} props - Component properties.
 * @param {Function} props.onSearch - Callback function triggered when the search term changes.
 * @param {string} [props.searchTerm] - The current search term value (optional).
 *
 * @returns {JSX.Element} Rendered Header component.
 * 
 * @component
 */
const Header = ({ onSearch , searchTerm }) => {
    const [searchValue, setSearchValue] = useState(searchTerm || "");
    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);

    // Use layout context for sidebar state
    const { 
        isSidebarOpen, 
        toggleSidebar
    } = useLayout();

    const { darkMode } = useTheme();

    const handleToggleSidebar = () => {
        toggleSidebar();
    };

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

   /**
   * Handles the Enter key press inside the search field.
   * Executes search immediately, bypassing the debounce delay.
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event.
   */
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

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="top-0 left-0 right-0 bg-[#fff] dark:bg-[#121212] w-full h-fit px-5 py-2 relative flex-1 flex items-center justify-between z-50 border-b border-[#333]">

            <div className="flex items-center gap-4">
                {/* Menu Toggle Button Only */}
                <div className="flex items-center md:gap-2 w-[15%] md:w-fit">
                    {/* Menu Button - Works for both mobile and desktop */}
                    <button 
                        className="transition-colors hover:fill-[#b3b3b3] fill-[#000] dark:fill-[#b3b3b3]"
                        onClick={handleToggleSidebar}
                        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
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
                            className={`w-[2500px] h-12 md:w-[170px] ${darkMode ? 'block' : 'hidden'}`} 
                            src={IMAGES.DARKLOGO} 
                            alt="Dark mode logo"
                        />
                    )}
                    {IMAGES.LOGO && (
                        <img 
                            className={`w-[290px] h-12 md:w-[170px] ${darkMode ? 'hidden' : 'block'}`} 
                            src={IMAGES.LIGHTLOGO} 
                            alt="Light mode logo"
                        />
                    )}
                </div>
            </div>
            
            
            {/* Search container */}
            <div className="flex items-center w-[350px] h-10 px-3">
                <IoSearchOutline color="#b3b3b3" className="hidden md:block mr-3" size={22}/>
                <input
                    ref={searchInputRef} 
                    type="text" 
                    placeholder="Search" 
                    value={searchValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyPress}
                    className="border border-[#b3b3b3] rounded-[16px] dark:opacity-30 opacity-50 bg-transparent dark:bg-[#121212] md:w-full ml-2 md:ml-0 w-20  py-2 px-4 dark:placeholder:text-[#b3b3b3] placeholder:text-[#000000] hover:border-[#9A7B4F]" 
                />

                {/* Adding Clear search button */}
                {searchValue && (
                    <button 
                        onClick={clearSearch}
                        className="ml-2 text-[#b3b3b3] hover:text-black dark:hover:text-white transition-colors"
                        title="Clear search">
                        ×
                    </button>
                )}
            </div>
            
            {/* Icons container */}
            <div className="flex items-center justify-center">
                <div className="hidden md:block rounded-full w-10 h-10 dark:bg-[#65350F] bg-[#9D610E] grid place-items-center cursor-pointer hover:bg-[#9A7B4F] mr-3 p-2">
                    <IoNotificationsOutline color="#b3b3b3" size={22}/>
                </div>
                <div className="hidden md:flex rounded-full w-10 h-10 dark:bg-[#65350F] bg-[#9D610E] grid place-items-center cursor-pointer hover:bg-[#9A7B4F] mr-3 p-2">
                    <IoBookOutline color="#b3b3b3" size={22} />
                </div>
                <div className="rounded-full w-10 h-10 dark:bg-[#65350F] bg-[#9D610E] grid place-items-center cursor-pointer hover:bg-[#9A7B4F] mr-3">
                    <IoPersonOutline color="#b3b3b3" size={22} />
                </div>
            </div>
        </div>
    );
};

export default Header;