import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { useAudio } from '../utilities/AudioContext';
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useLayout } from "../layouts/LayoutContext.jsx";


const ResumePlaylistPage = () => {
    const navigate = useNavigate();
    const { 
        recentlyPlayed, 
        playEpisode, 
        currentEpisode, 
        isPlaying, 
        getEpisodeProgress,
        clearRecentlyPlayed 
    } = useAudio();
    
    const { 
        isSidebarOpen, 
        isMobileSidebarOpen 
    } = useLayout();

    const [sortedEpisodes, setSortedEpisodes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Sort episodes by most recently played
    useEffect(() => {
        const sorted = [...recentlyPlayed].sort((a, b) => {
            const progressA = getEpisodeProgress(a.episodeId);
            const progressB = getEpisodeProgress(b.episodeId);
            
            if (progressA && progressB) {
                return new Date(progressB.lastListened) - new Date(progressA.lastListened);
            }
            return 0;
        });
        setSortedEpisodes(sorted);
    }, [recentlyPlayed, getEpisodeProgress]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handlePlayEpisode = (episode) => {
        playEpisode(episode);
    };

    // Filter episodes based on search term
    const filteredEpisodes = sortedEpisodes.filter(episode => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            episode.title?.toLowerCase().includes(searchLower) ||
            episode.showTitle?.toLowerCase().includes(searchLower)
        );
    });

    const handleNavigateToPodcast = (episode) => {
        const podcastId = episode.episodeId.split('-')[0];
        navigate(`/podcast/${podcastId}`);
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

    const handleClearPlaylist = () => {
        if (window.confirm('Are you sure you want to clear your resume playlist? This action cannot be undone.')) {
            clearRecentlyPlayed();
        }
    };

    const { openMobileSidebar } = useLayout();

    return (
        <>
            <Header onSearch={handleSearch} searchTerm={searchTerm}  />

            {/* Mobile Sidebar Overlay */}
            <div className="h-full flex">
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
                    flex-1 min-h-screen transition-all duration-300 dark:text-white text-[#000] dark:bg-[#1a1a1a] bg-[#F4F4F4] p-4 lg:p-6
                    ${isSidebarOpen ? 'mt-[560px] lg:ml-0 lg:mt-0' : 'lg:ml-0'}
                    w-full
                `}>
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                                        Resume Playlist
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Continue listening to your recently played episodes
                                        {searchTerm && (
                                            <span className="ml-2">
                                                - Search results for "{searchTerm}"
                                            </span>
                                        )}
                                    </p>
                                </div>
                                
                                {recentlyPlayed.length > 0 && (
                                    <button
                                        onClick={handleClearPlaylist}
                                        className="mt-4 md:mt-0 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                    {filteredEpisodes.length} {searchTerm ? 'filtered' : ''} episodes
                                    {searchTerm && filteredEpisodes.length !== recentlyPlayed.length && (
                                        <span> (of {recentlyPlayed.length} total)</span>
                                    )}
                                </span>
                                <span>•</span>
                                <span>
                                    {filteredEpisodes.filter(ep => {
                                        const progress = getEpisodeProgress(ep.episodeId);
                                        return progress && progress.completed;
                                    }).length} completed
                                </span>
                            </div>
                        </div>

                        {/* Episodes List */}
                        {recentlyPlayed.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-black dark:text-white mb-2">
                                    No episodes yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Start listening to podcasts to build your resume playlist
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-[#65350F] hover:bg-[#1ed760] text-white rounded-full transition-colors"
                                >
                                    Browse Podcasts
                                </button>
                            </div>
                        ) : filteredEpisodes.length === 0 ? (
                            // Show message when search returns no results
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-black dark:text-white mb-2">
                                    No episodes found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    No episodes match your search for "{searchTerm}"
                                </p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-6 py-3 bg-[#65350F] hover:bg-[#1ed760] text-white rounded-full transition-colors"
                                >
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredEpisodes.map((episode, index) => {
                                    const isCurrentlyPlaying = currentEpisode?.episodeId === episode.episodeId && isPlaying;
                                    const progress = getEpisodeProgress(episode.episodeId);
                                    const progressPercentage = getProgressPercentage(episode.episodeId);
                                    
                                    return (
                                        <div 
                                            key={episode.episodeId}
                                            className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#282828] transition-colors cursor-pointer group"
                                            onClick={() => handlePlayEpisode(episode)}
                                        >
                                            {/* Episode Number */}
                                            <div className="flex-shrink-0 w-8 text-center">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {index + 1}
                                                </span>
                                            </div>

                                            {/* Episode Image */}
                                            <div className="flex-shrink-0 relative">
                                                <img 
                                                    src={episode.showImage || "/src/assets/SippiCup_logo.png"} 
                                                    alt={episode.showTitle}
                                                    className="w-16 h-16 rounded-md object-cover"
                                                />
                                                {isCurrentlyPlaying && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                                        <div className="w-3 h-3 bg-[#1ed760] rounded-full animate-pulse"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Episode Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-black dark:text-white text-lg truncate">
                                                            {episode.title}
                                                            {isCurrentlyPlaying && (
                                                                <span className="ml-2 text-xs text-[#1ed760]">● Playing</span>
                                                            )}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                            {episode.showTitle} • Season {episode.season} Episode {episode.episode}
                                                        </p>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNavigateToPodcast(episode);
                                                        }}
                                                        className="ml-4 px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        View Show
                                                    </button>
                                                </div>
                                                
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
                                                    handlePlayEpisode(episode);
                                                }}
                                                className="flex-shrink-0 p-3 rounded-full bg-[#65350F] hover:bg-[#1ed760] text-white transition-colors"
                                                title={isCurrentlyPlaying ? 'Pause' : 'Play'}
                                            >
                                                {isCurrentlyPlaying ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResumePlaylistPage;