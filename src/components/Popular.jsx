import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Popular = () => {
    const [favorites, setFavorites] = useState([]);
    const [sortBy, setSortBy] = useState('dateAdded');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const savedFavorites = localStorage.getItem('podcastFavorites');
        if (savedFavorites) {
            const parsedFavorites = JSON.parse(savedFavorites);
            console.log('Loaded favorites:', parsedFavorites); // Debug log
            setFavorites(parsedFavorites);
        }
    }, []);

    const removeFromFavorites = (episodeId) => {
        const updatedFavorites = favorites.filter(fav => fav.episodeId !== episodeId);
        setFavorites(updatedFavorites);
        localStorage.setItem('podcastFavorites', JSON.stringify(updatedFavorites));
    };

    const handleSearch = (term) => {
        console.log('Search term:', term);
    };

    const handleSidebarToggle = (isOpen) => {
        setIsSidebarOpen(isOpen);
        setIsMobileSidebarOpen(isOpen);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    // Use useEffect to sync DOM with state
    useEffect(() => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (isMobileSidebarOpen) {
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
    }, [isMobileSidebarOpen]);


    // Group favorites by show
    const groupedFavorites = favorites.reduce((groups, favorite) => {
        const showTitle = favorite.showTitle;
        if (!groups[showTitle]) {
            groups[showTitle] = [];
        }
        groups[showTitle].push(favorite);
        return groups;
    }, {});

    // Sort episodes within each group
    Object.keys(groupedFavorites).forEach(showTitle => {
        groupedFavorites[showTitle].sort((a, b) => {
            if (sortBy === 'title') {
                return sortOrder === 'asc' 
                    ? a.episodeTitle.localeCompare(b.episodeTitle)
                    : b.episodeTitle.localeCompare(a.episodeTitle);
            } else {
                return sortOrder === 'asc'
                    ? new Date(a.dateAdded) - new Date(b.dateAdded)
                    : new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });
    });

    return (
        <>
            <Header onSearch={handleSearch} onToggleSidebar={handleSidebarToggle} />

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className="xl:relative sm:fixed inset-0 dark:bg-[#1a1a1a] bg-[#F4F4F4] bg-opacity-50 z-30 lg:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            <div className="min-h-screen flex flex-col xl:flex-row">
                {/* Sidebar */}
                <div className={`${isMobileSidebarOpen ? 'sm:relative inset-0 flex items-center justify-center z-40' : 'hidden'}`}>
                    <Sidebar />
                </div>
            
                {/* Main Content */}
                <div className={`flex-1 w-full dark:text-white text-[#000] dark:bg-[#1a1a1a] bg-[#F4F4F4] p-4 lg:p-6 ${
                    isSidebarOpen ? 'xl:border-l xl:border-gray-300 xl:dark:border-[#333]' : ''
                }`}>
                    <div className="w-full flex flex-col">
                        <h1 className="text-3xl font-bold mb-6">Popular / Favorites</h1>
                        
                        <div className="mb-4 p-2 bg-yellow-900 text-yellow-200 rounded text-sm">
                            Total favorites found: {favorites.length}
                        </div>

                        {/* Sorting Controls */}
                        <div className="flex gap-4 mb-6">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-[#282828] text-white px-3 py-2 rounded border border-[#333]"
                            >
                                <option value="dateAdded">Date Added</option>
                                <option value="title">Episode Title</option>
                            </select>
                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-white dark:bg-[#282828] text-black dark:text-white px-3 py-2 rounded border border-gray-300 dark:border-[#333] text-sm"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>

                        {Object.keys(groupedFavorites).length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">No favorites yet. Start adding episodes to your favorites!</p>
                                <p className="text-gray-500 text-sm">
                                    Go to a podcast detail page and click the heart icon on episodes to add them to favorites.
                                </p>
                            </div>
                        ) : (
                            Object.keys(groupedFavorites).map(showTitle => (
                                <div key={showTitle} className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4">{showTitle}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {groupedFavorites[showTitle].map(favorite => (
                                            <div key={favorite.episodeId} className="bg-[#282828] p-4 rounded-lg hover:bg-[#65350F] transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-white">{favorite.episodeTitle}</h3>
                                                    <button 
                                                        onClick={() => removeFromFavorites(favorite.episodeId)}
                                                        className="text-red-500 hover:text-red-400 transition-colors text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                                                    {favorite.episodeDescription}
                                                </p>
                                                <p className="text-gray-400 text-sm mb-2">
                                                    Season {favorite.seasonNumber}, Episode {favorite.episodeNumber}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    Added: {new Date(favorite.dateAdded).toLocaleDateString()} at {new Date(favorite.dateAdded).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Popular;