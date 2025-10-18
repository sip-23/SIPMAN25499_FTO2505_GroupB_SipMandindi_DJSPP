import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { useLayout } from "../layouts/LayoutContext.jsx";
import { useAudio } from "../utilities/AudioContext.jsx";

const Favourites = () => {
    const [favorites, setFavorites] = useState([]);
    const [sortBy, setSortBy] = useState('dateAdded');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const { playEpisode, currentEpisode, isPlaying, getEpisodeProgress } = useAudio();
    
    // Use layout context
    const { 
        isSidebarOpen, 
        isMobileSidebarOpen
    } = useLayout();

    // Check if audio URL is valid - improved version
    const isValidAudioUrl = (url) => {
        if (!url) return false;
        // Check if it's a valid URL format and has an audio file extension
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname.toLowerCase();
            const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm'];
            
            // Check if URL has an audio file extension
            const hasAudioExtension = audioExtensions.some(ext => pathname.endsWith(ext));
            
            // Also accept URLs from your podcast API domain
            const isFromPodcastApi = urlObj.hostname.includes('podcast-api.netlify.app');
            
            return hasAudioExtension || isFromPodcastApi;
        } catch {
            return false;
        }
    };

    // Debug function to check what's in localStorage
    const debugFavorites = () => {
        const savedFavorites = localStorage.getItem('podcastFavorites');
        if (savedFavorites) {
            const parsedFavorites = JSON.parse(savedFavorites);
            console.log('DEBUG - Raw favorites from localStorage:', parsedFavorites);
            parsedFavorites.forEach((fav, index) => {
                console.log(`Favorite ${index + 1}:`, {
                    title: fav.episodeTitle,
                    audioUrl: fav.audioUrl,
                    hasAudioUrl: !!fav.audioUrl,
                    isValid: isValidAudioUrl(fav.audioUrl)
                });
            });
        }
    };

    useEffect(() => {
        const savedFavorites = localStorage.getItem('podcastFavorites');
        if (savedFavorites) {
            const parsedFavorites = JSON.parse(savedFavorites);
            console.log('Loaded favorites:', parsedFavorites);
            
            // Enhanced favorites with proper audio URL validation
            const enhancedFavorites = parsedFavorites.map(favorite => ({
                ...favorite,
                hasValidAudio: isValidAudioUrl(favorite.audioUrl)
            }));
            
            setFavorites(enhancedFavorites);
            
            // Debug log to see what's happening
            console.log('Enhanced favorites:', enhancedFavorites);
            enhancedFavorites.forEach((fav, index) => {
                console.log(`Enhanced ${index + 1}:`, {
                    title: fav.episodeTitle,
                    audioUrl: fav.audioUrl,
                    hasValidAudio: fav.hasValidAudio
                });
            });
        }
        
        // Run debug on component mount
        debugFavorites();
    }, []);

    const removeFromFavorites = (episodeId) => {
        const updatedFavorites = favorites.filter(fav => fav.episodeId !== episodeId);
        setFavorites(updatedFavorites);
        localStorage.setItem('podcastFavorites', JSON.stringify(updatedFavorites));
    };

    const handlePlayEpisode = async (favorite) => {
        // Check if the favorite has a valid audio URL
        if (!favorite.hasValidAudio) {
            console.error('No valid audio URL found for favorite:', favorite);
            console.log('Audio URL that failed:', favorite.audioUrl);
            alert('This episode does not have a valid audio file available.');
            return;
        }

        console.log('Attempting to play audio URL:', favorite.audioUrl);

        const episodeData = {
            episodeId: favorite.episodeId,
            audioUrl: favorite.audioUrl,
            title: favorite.episodeTitle,
            season: favorite.seasonNumber,
            episode: favorite.episodeNumber,
            showTitle: favorite.showTitle,
            showImage: favorite.showImage
        };
        
        try {
            await playEpisode(episodeData);
        } catch (error) {
            console.error('Failed to play episode:', error);
            alert('Failed to play this episode. The audio file may be unavailable.');
        }
    };

    const handleNavigateToPodcast = (favorite, e) => {
        e.stopPropagation();
        const podcastId = favorite.episodeId.split('-')[0];
        navigate(`/podcast/${podcastId}`);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getProgressPercentage = (episodeId) => {
        const progress = getEpisodeProgress(episodeId);
        if (!progress || !progress.duration) return 0;
        return (progress.currentTime / progress.duration) * 100;
    };

    // Filter favorites based on search term
    const filteredFavorites = favorites.filter(favorite => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            favorite.episodeTitle?.toLowerCase().includes(searchLower) ||
            favorite.showTitle?.toLowerCase().includes(searchLower) ||
            favorite.episodeDescription?.toLowerCase().includes(searchLower)
        );
    });

    // Group favorites by show
    const groupedFavorites = filteredFavorites.reduce((groups, favorite) => {
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
            <Header onSearch={handleSearch} searchTerm={searchTerm} />

            {/* Debug Button - Remove in production */}
            {/* <button 
                onClick={debugFavorites}
                className="fixed top-20 right-4 z-50 bg-blue-500 text-white p-2 rounded text-sm"
                style={{ display: 'none' }} // Hide by default, change to 'block' to see it
            >
                Debug Favorites
            </button> */}

            <div className="h-full flex flex">
                {/* Sidebar - Fixed positioning */}
                <div className={`
                    z-40 mt-[-20px] lg:mt-0
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    transition-transform duration-300 ease-in-out
                `}>
                    <Sidebar />
                </div>
            
                {/* Main Content */}
                <div className={`
                    main-content flex-1 min-h-screen transition-all duration-300 dark:text-white text-[#000] dark:bg-[#1a1a1a] bg-[#F4F4F4] p-4 lg:p-6
                    ${isSidebarOpen ? 'mt-[500px] lg:ml-0 lg:mt-0' : ''}
                    w-full
                `}>
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                                        Favorite Episodes
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Your collection of loved podcast episodes
                                        {searchTerm && (
                                            <span className="ml-2">
                                                - Search results for "{searchTerm}"
                                            </span>
                                        )}
                                    </p>
                                </div>
                                
                                {/* Debug and Sorting Controls */}
                                <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                                    {/* Debug button - remove in production */}
                                    {/* <button 
                                        onClick={debugFavorites}
                                        className="px-3 py-2 bg-yellow-500 text-black rounded text-sm md:hidden"
                                    >
                                        Debug
                                    </button> */}
                                    
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-white dark:bg-[#282828] text-black dark:text-white px-3 py-2 rounded border border-gray-300 dark:border-[#333] text-sm"
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
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                                <span >{filteredFavorites.length} {searchTerm ? 'filtered' : ''} episodes</span>
                                <span>•</span>
                                <span>
                                    {Object.keys(groupedFavorites).length} shows
                                </span>
                                <span>•</span>
                                <span>
                                    {favorites.filter(fav => fav.hasValidAudio).length} with audio
                                </span>
                            </div>
                        </div>

                        {/* Episodes List */}
                        {filteredFavorites.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-black dark:text-white mb-2">
                                    {searchTerm ? 'No matching episodes' : 'No favorite episodes yet'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {searchTerm 
                                        ? 'No episodes match your search criteria'
                                        : 'Start adding episodes to your favorites by clicking the heart icon'
                                    }
                                </p>
                                {searchTerm ? (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="px-6 py-3 bg-[#65350F] hover:bg-[#1ed760] text-white rounded-full transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-6 py-3 bg-[#65350F] hover:bg-[#1ed760] text-white rounded-full transition-colors"
                                    >
                                        Browse Podcasts
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8 lg:max-w-[625px] xl:max-w-fit">
                                {Object.keys(groupedFavorites).map(showTitle => (
                                    <div key={showTitle} className="space-y-4">
                                        {/* Show Header */}
                                        <div className="flex items-center gap-2 md:gap-4 mb-4">
                                            <img 
                                                src={groupedFavorites[showTitle][0]?.showImage || "/src/assets/SippiCup_logo.png"} 
                                                alt={showTitle}
                                                className="w-12 h-12 rounded-md object-cover"
                                            />
                                            <h2 className="text-2xl font-bold text-black dark:text-white">
                                                {showTitle}
                                            </h2>
                                            <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                                                ({groupedFavorites[showTitle].length} episodes)
                                            </span>
                                        </div>

                                        {/* Episodes for this show */}
                                        {groupedFavorites[showTitle].map((favorite, index) => {
                                            const isCurrentlyPlaying = currentEpisode?.episodeId === favorite.episodeId && isPlaying;
                                            const progress = getEpisodeProgress(favorite.episodeId);
                                            const progressPercentage = getProgressPercentage(favorite.episodeId);
                                            const hasAudio = favorite.hasValidAudio;
                                            
                                            return (
                                                <div 
                                                    key={favorite.episodeId}
                                                    className={`flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-[#181818] hover:ring-4 hover:ring-[#9D610E] dark:hover:bg-[#282828] transition-colors cursor-pointer group ${
                                                        !hasAudio ? 'opacity-60' : ''
                                                    }`}
                                                    onClick={() => hasAudio && handlePlayEpisode(favorite)}
                                                >
                                                    {/* Episode Number */}
                                                    <div className="hidden lg:block flex-shrink-0 w-8 text-center">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {index + 1}
                                                        </span>
                                                    </div>

                                                    {/* Episode Image */}
                                                    <div className="flex-shrink-0 relative">
                                                        <img 
                                                            src={favorite.showImage || "/src/assets/SippiCup_logo.png"} 
                                                            alt={favorite.showTitle}
                                                            className="w-16 h-16 rounded-md object-cover"
                                                        />
                                                        {isCurrentlyPlaying && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                                                <div className="w-3 h-3 bg-[#1ed760] rounded-full animate-pulse"></div>
                                                            </div>
                                                        )}
                                                        {!hasAudio && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-md">
                                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Episode Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col md:flex-row md:items-start justify-between md:mb-2">
                                                            <div className="flex-1 w-full ">
                                                                <h3 className="font-medium text-black dark:text-white text-lg w-full truncate">
                                                                    {favorite.episodeTitle}
                                                                    {isCurrentlyPlaying && (
                                                                        <span className="ml-2 text-xs text-[#1ed760]">Playing</span>
                                                                    )}
                                                                    {!hasAudio && (
                                                                        <span className="ml-2 text-xs text-red-500">No Audio</span>
                                                                    )}
                                                                </h3>
                                                                <p className=" text-gray-600 dark:text-gray-400 text-sm">
                                                                    Season {favorite.seasonNumber} Episode {favorite.episodeNumber}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 md:ml-4">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleNavigateToPodcast(favorite, e);
                                                                    }}
                                                                    className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100"
                                                                >
                                                                    View Show
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeFromFavorites(favorite.episodeId);
                                                                    }}
                                                                    className="p-2 text-red-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Remove from favorites"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Episode Description */}
                                                        <p className="hidden md:block text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                                                            {favorite.episodeDescription || 'No description available'}
                                                        </p>
                                                        
                                                        {/* Audio URL Debug Info - Remove in production */}
                                                        {!hasAudio && favorite.audioUrl && (
                                                            <div className="hidden md:block mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
                                                                <p className="text-yellow-800 dark:text-yellow-200">
                                                                    <strong>Debug Info:</strong> URL exists but failed validation: {favorite.audioUrl}
                                                                </p>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Date Added */}
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            Added on {new Date(favorite.dateAdded).toLocaleDateString()}
                                                        </p>
                                                        
                                                        {/* Progress Bar */}
                                                        {progress && progress.duration && (
                                                            <div className="mt-2">
                                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                    <span>
                                                                        {progress.completed ? 'Completed' : `${Math.round(progressPercentage)}% played`}
                                                                    </span>
                                                                    <span>
                                                                        {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-[#9D610E] h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${progressPercentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Play Button */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (hasAudio) {
                                                            handlePlayEpisode(favorite);
                                                            } else {
                                                            alert(`This episode does not have a valid audio file available. 
                                                                Audio URL: ${favorite.audioUrl || 'No URL found'}
                                                                You may need to re-add this episode from the podcast page.`);
                                                            }
                                                        }}
                                                        className={`flex items-center gap-1 flex-shrink-0 md:min-w-[130px] p-3 rounded-full transition-colors ${
                                                            hasAudio 
                                                            ? isCurrentlyPlaying 
                                                                ? 'bg-[#1ed760] hover:bg-[#1ed760] text-white' 
                                                                : 'bg-[#65350F] hover:bg-[#1ed760] text-white'
                                                            : 'bg-gray-400 cursor-not-allowed text-gray-200'
                                                        }`}
                                                        title={hasAudio ? (isCurrentlyPlaying ? 'Pause' : 'Play') : `No audio available: ${favorite.audioUrl || 'No URL'}`}
                                                        disabled={!hasAudio}
                                                        >
                                                        {isCurrentlyPlaying ? (
                                                            <>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                                                            </svg>
                                                            <span className="hidden md:block">Pause</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8 5v14l11-7z"/>
                                                            </svg>
                                                            <span className="hidden md:block">
                                                                {progress ? 'Resume' : 'Listen Now'}
                                                            </span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Favourites;