
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../utilities/ThemeContext";
import { useLayout } from "../layouts/LayoutContext";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode, toggleTheme } = useTheme();
    const { closeSidebar, isMobileView, isSidebarOpen } = useLayout();

    const handleNavigation = (path) => {
        navigate(path);
        // Close sidebar on mobile navigation
        if (isMobileView) {
            closeSidebar();
        }
    };

    // Theme toggle functionality
    const handleThemeToggle = () => {
        toggleTheme();
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside
            id="sidebar"
            className={`sidebar-visible absolute lg:relative inset-0 lg:inset-auto mx-auto sm:my-4 md:my-4 lg:my-0 
                        w-[90vw] sm:w-[300px] md:w-[350px] lg:w-[350px] lg:h-full
                        h-fit 
                        dark:bg-[#121212] bg-[#ffffff] 
                        p-5 z-40 
                        border border-gray-300 dark:border-[#333] 
                        rounded-b-[4px] lg:rounded-b-none
                        shadow-m lg:shadow-none
                        overflow-y-auto
                        transform transition-transform duration-300 ease-in-out
                        ${isMobileView ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                       `}
        >
            {/* Close Button  */}
            <button 
                onClick={closeSidebar}
                className="absolute top-4 right-4 p-2"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>

            <div className="w-full flex flex-col">
                {/* Home */}
                <button 
                    onClick={() => handleNavigation('/')}
                    className={`flex items-center w-full h-[55px] ml-[-40px] gap-3 cursor-pointer rounded-full transition-colors ${
                        isActive('/') ? 'dark:bg-[#65350F] bg-[#9D610E]' : 'dark:hover:bg-[#65350F] hover:bg-[#D9D9D9]'
                    }`}
                >
                    <div className="flex items-center gap-3 ml-12">
                        <svg className="fill-[#000000] dark:fill-[#b3b3b3]" xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 32 32" version="1.1">
                            <title>house</title>
                            <path d="M0 16h4l12-13.696 12 13.696h4l-13.984-16h-4zM4 32h8v-9.984q0-0.832 0.576-1.408t1.44-0.608h4q0.8 0 1.408 0.608t0.576 1.408v9.984h8v-13.408l-12-13.248-12 13.248v13.408zM26.016 6.112l4 4.576v-8.672h-4v4.096z"/>
                        </svg>
                        <span className="font-medium text-black dark:text-[#b3b3b3] text-[14.5px]">Home</span>
                    </div>
                </button>

                {/* Favourites */}
                <button 
                    onClick={() => handleNavigation('/favourites')}
                    className={`flex items-center w-full h-[55px] ml-[-40px] gap-3 cursor-pointer rounded-full transition-colors ${
                        isActive('/favourites') ? 'dark:bg-[#65350F] bg-[#9D610E]' : 'dark:hover:bg-[#65350F] hover:bg-[#D9D9D9]'
                    }`}
                >
                    <div className="flex items-center gap-3 ml-12">
                        <svg className="fill-[#000000] dark:fill-[#b3b3b3]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="22px" height="22px" viewBox="0 -2.5 21 21" version="1.1">
                            <title>love [#1489]</title>
                            <g id="Page-1" stroke="none" strokeWidth="1" fillRule="evenodd">
                                <g id="Dribbble-Light-Preview" transform="translate(-99.000000, -362.000000)">
                                    <g id="icons" transform="translate(56.000000, 160.000000)">
                                        <path d="M55.5929644,215.348992 C55.0175653,215.814817 54.2783665,216.071721 53.5108177,216.071721 C52.7443189,216.071721 52.0030201,215.815817 51.4045211,215.334997 C47.6308271,212.307129 45.2284309,210.70073 45.1034811,207.405962 C44.9722313,203.919267 48.9832249,202.644743 51.442321,205.509672 C51.9400202,206.088455 52.687619,206.420331 53.4940177,206.420331 C54.3077664,206.420331 55.0606152,206.084457 55.5593644,205.498676 C57.9649106,202.67973 62.083004,203.880281 61.8950543,207.507924 C61.7270546,210.734717 59.2322586,212.401094 55.5929644,215.348992 M53.9066671,204.31012 C53.8037672,204.431075 53.6483675,204.492052 53.4940177,204.492052 C53.342818,204.492052 53.1926682,204.433074 53.0918684,204.316118 C49.3717243,199.982739 42.8029348,202.140932 43.0045345,207.472937 C43.1651842,211.71635 46.3235792,213.819564 50.0426732,216.803448 C51.0370217,217.601149 52.2739197,218 53.5108177,218 C54.7508657,218 55.9898637,217.59915 56.9821122,216.795451 C60.6602563,213.815565 63.7787513,211.726346 63.991901,207.59889 C64.2754005,202.147929 57.6173611,199.958748 53.9066671,204.31012" id="love-[#1489]"></path>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        <span className="font-medium text-black dark:text-[#b3b3b3] text-[14.5px]">Favourites</span>
                    </div>
                </button>

                {/* Recommended */}
                <button 
                    onClick={() => handleNavigation('/recommended')}
                    className={`flex items-center w-full h-[55px] ml-[-40px] gap-3 cursor-pointer rounded-full transition-colors ${
                        isActive('/recommended') ? 'dark:bg-[#65350F] bg-[#9D610E]' : 'dark:hover:bg-[#65350F] hover:bg-[#D9D9D9]'
                    }`}
                >
                    <div className="flex items-center gap-3 ml-12">
                        <svg className="stroke-[#000000] dark:stroke-[#b3b3b3] fill-[#000000] dark:fill-[#b3b3b3]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="26px" height="26px" viewBox="0 0 24 24" version="1.1">
                            <g id="🔍-Product-Icons" strokeWidth="1" fillRule="evenodd">
                                <g id="ic_fluent_recommended_24_regular" fillRule="nonzero">
                                    <path d="M12,2 C16.418278,2 20,5.581722 20,10 C20,12.5480905 18.8087155,14.8179415 16.9527141,16.2829857 L17.0016031,16.2440856 L17.0007001,22.2453233 C17.0007001,22.7945586 16.4297842,23.157512 15.9324488,22.9244522 L12.0005291,21.0818879 L8.07069102,22.9243915 C7.5733438,23.1575726 7.00231009,22.7946207 7.00231009,22.2453233 L7.00069412,16.2459273 C5.1725143,14.7820178 4,12.5279366 4,10 C4,5.581722 7.581722,2 12,2 Z M15.5012202,17.1951723 L15.5414683,17.1754104 C14.4738996,17.7033228 13.2715961,18 12,18 C10.8745896,18 9.80345551,17.7676152 8.83196505,17.3482129 L8.50180347,17.1966457 L8.50231009,21.065345 L11.6820691,19.5745158 C11.8837425,19.4799613 12.1170099,19.479939 12.3187014,19.5744551 L15.5007001,21.0655937 L15.5012202,17.1951723 Z M12,3.5 C8.41014913,3.5 5.5,6.41014913 5.5,10 C5.5,13.5898509 8.41014913,16.5 12,16.5 C15.5898509,16.5 18.5,13.5898509 18.5,10 C18.5,6.41014913 15.5898509,3.5 12,3.5 Z M12.2287851,6.64234387 L13.1413078,8.49499737 L15.185271,8.79035658 C15.3945922,8.82060416 15.4782541,9.07783021 15.326776,9.22542655 L13.8484251,10.6658938 L14.1974269,12.7012993 C14.2331646,12.9097242 14.0143068,13.0685941 13.8272087,12.9700424 L12,12.0075816 L10.1727912,12.9700424 C9.98560603,13.06864 9.76668059,12.9095814 9.80260908,12.7010893 L10.1533251,10.6658938 L8.67333197,9.22553178 C8.52171667,9.07797642 8.60533875,8.82061413 8.81472896,8.79035658 L10.8586922,8.49499737 L11.7712148,6.64234387 C11.8646966,6.45255204 12.1353033,6.45255204 12.2287851,6.64234387 Z" id="🎨-Color"></path>
                                </g>
                            </g>
                        </svg>
                        <span className="font-medium text-black dark:text-[#b3b3b3] text-[14.5px]">Recommended</span>
                    </div>
                </button>
            </div>

            {/* Division Line */}
            <hr className="dark:border-[#b3b3b3] border-[#000000] my-7 opacity-30"/>

            {/* Resume List */}
            <div className="w-full flex flex-col gap-3">
                {/* Header */}
                <button 
                    onClick={() => handleNavigation('/resume-playlist')}
                    className={`flex items-center justify-between w-full h-[55px] ml-[-40px] gap-3 cursor-pointer rounded-full transition-colors ${
                        isActive('/resume-playlist') ? 'dark:bg-[#65350F] bg-[#9D610E]' : 'dark:hover:bg-[#65350F] hover:bg-[#D9D9D9]'
                    }`}
                >
                    <div className="flex items-center gap-3 ml-12">
                        <svg className="fill-[#000000] dark:fill-[#b3b3b3]" xmlns="http://www.w3.org/2000/svg" width="26px" height="26px" viewBox="0 0 32 32" id="Outlined">
                            <g id="Fill">
                                <path d="M22,2H10A3,3,0,0,0,7,5V30.3l7.73-3.61a3,3,0,0,1,2.54,0L25,30.3V5A3,3,0,0,0,22,2Zm1,25.16-4.89-2.28a5,5,0,0,0-4.22,0L9,27.16V8H23ZM23,6H9V5a1,1,0,0,1,1-1H22a1,1,0,0,1,1,1Z"/>
                                <path d="M15,19.58A2,2,0,0,0,16.41,19l4.3-4.29-1.42-1.42L15,17.59l-2.29-2.3-1.42,1.42L13.59,19A2,2,0,0,0,15,19.58Z"/>
                            </g>
                        </svg>
                        <span className="font-medium text-black dark:text-[#b3b3b3] text-[14.5px]">Resume Playlist</span>
                    </div>
                    <svg className="cursor-pointer mr-3 stroke-[#000000] dark:stroke-[#b3b3b3]" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Top 3 Episodes */}
            </div>

            {/* Division line */}
            <hr className="dark:border-[#b3b3b3] border-[#000000] my-7 opacity-30"/>

            {/* Control Panel */}
            <div className="w-full flex flex-col gap-3 px-3 ">
                {/* Theme Toggle */}
                <div className="flex items-center justify-center cursor-pointer w-full h-[48px] rounded-[6px] dark:bg-[#65350F] mt-4 mb-8 transition-colors bg-[#9D610E] hover:bg-[#683F06] dark:hover:bg-[#9A7B4F]">
                    <svg className=" sm:ml-[68px] ml-[70px]" xmlns="http://www.w3.org/2000/svg" width="19" height="19">
                        <text x="2" y="15" fontSize="14" fill="#828FA3">🌞</text>
                    </svg>
                    <label className="toggle relative inline-flex items-center w-[40px] h-[20px] shrink-0 cursor-pointer mx-auto">
                        <input 
                            type="checkbox" 
                            id="themeToggle" 
                            className="absolute peer ml-2 sr-only" 
                            checked={darkMode}
                            onChange={handleThemeToggle}
                        />
                        <div className="slider absolute top-0 left-0 right-0 bottom-0 rounded-full bg-[#121212] transition-colors duration-300 ease-in-out peer-checked:bg-[#20212C]"></div>
                        <div className="absolute h-[14px] w-[14px] left-[3px] bottom-[3px] bg-white rounded-full transition-all duration-300 ease-in-out peer-checked:translate-x-[20px]"></div>
                    </label>
                    <svg className="mr-[70px]" xmlns="http://www.w3.org/2000/svg" width="19" height="19">
                        <text x="2" y="15" fontSize="14" fill="#828FA3">🌚</text>
                    </svg>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;