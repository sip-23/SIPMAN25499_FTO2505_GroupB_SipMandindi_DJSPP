import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { useAudio } from '../utilities/AudioContext';


const ResumePlaylist = () => {
    const navigate = useNavigate();
    const { recentlyPlayed, playEpisode, currentEpisode, isPlaying } = useAudio();

    const handlePlayEpisode = (episode) => {
        playEpisode(episode);
    };

    const handleNavigateToPlaylist = () => {
        navigate('/resume-playlist');
    };

    const handleNavigateToEpisode = (episode) => {
        // Extract podcast ID from episodeId (format: "podcastId-sX-eX")
        const podcastId = episode.episodeId.split('-')[0];
        navigate(`/podcast/${podcastId}`);
    };

    const getEpisodeProgress = (episodeId) => {
        const progress = localStorage.getItem(`progress_${episodeId}`);
        return progress ? JSON.parse(progress) : null;
    };

    const getProgressPercentage = (episodeId) => {
        const progress = getEpisodeProgress(episodeId);
        if (!progress || !progress.duration) return 0;
        return (progress.currentTime / progress.duration) * 100;
    };

    if (topEpisodes.length === 0) {
        return (
            <div className="w-full">
                <button 
                    onClick={handleNavigateToPlaylist}
                    className="flex items-center justify-between w-full h-[55px] gap-3 cursor-pointer rounded-full transition-colors dark:hover:bg-[#65350F] hover:bg-[#D9D9D9] mb-4"
                >
                    <div className="flex items-center gap-3 ml-6">
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
                
                <div className="text-center py-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        No recent episodes
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Start listening to see your resume playlist
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <button 
                onClick={handleNavigateToPlaylist}
                className="flex items-center justify-between w-full h-[55px] gap-3 cursor-pointer rounded-full transition-colors dark:hover:bg-[#65350F] hover:bg-[#D9D9D9] mb-4"
            >
                <div className="flex items-center gap-3 ml-6">
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

            {/* Episode List */}
            <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
                {recentlyPlayed.map((episode, index) => {
                    const isCurrentlyPlaying = currentEpisode?.episodeId === episode.episodeId && isPlaying;
                    const progress = getEpisodeProgress(episode.episodeId);
                    const progressPercentage = getProgressPercentage(episode.episodeId);
                    
                    return (
                        <div 
                            key={`${episode.episodeId}-${index}`}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer dark:hover:bg-[#2a2a2a] hover:bg-[#f0f0f0] transition-colors group"
                            onClick={() => handlePlayEpisode(episode)}
                        >
                            {/* Episode Image */}
                            <div className="relative flex-shrink-0">
                                <img 
                                    src={episode.showImage || "/src/assets/SippiCup_logo.png"} 
                                    alt={episode.showTitle}
                                    className="w-10 h-10 rounded-md object-cover"
                                />
                                {isCurrentlyPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>

                            {/* Episode Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-black dark:text-white truncate">
                                    {episode.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {episode.showTitle}
                                </p>
                                
                                {/* Progress Bar */}
                                {progress && progress.duration && (
                                    <div className="mt-1">
                                        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1">
                                            <div 
                                                className="bg-[#9D610E] h-1 rounded-full transition-all duration-300"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>
                                                {progress.completed ? 'Completed' : `${Math.round(progressPercentage)}%`}
                                            </span>
                                            <span>
                                                S{episode.seasonNumber} E{episode.episodeNumber}
                                            </span>
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
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-[#65350F] hover:bg-[#1ed760] text-white"
                                title={isCurrentlyPlaying ? 'Pause' : 'Play'}
                            >
                                {isCurrentlyPlaying ? (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* View All Link (if more than 3 episodes) */}
            {recentlyPlayed.length > 3 && (
                <button 
                    onClick={handleNavigateToPlaylist}
                    className="w-full text-center mt-3 text-xs text-[#9D610E] hover:text-[#1ed760] transition-colors"
                >
                    View all {recentlyPlayed.length} episodes
                </button>
            )}
        </div>
    );
};

export default ResumePlaylist;