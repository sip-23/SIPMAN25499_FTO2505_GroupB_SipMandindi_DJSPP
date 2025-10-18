import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchPodcasts } from "../utilities/fetchPodcasts";
import LoadingSpinner from "../utilities/loadingSpinner";
import ErrorDisplay from "../utilities/loadingError";
import { IMAGES } from "../data/images";
import { useAudio } from "../utilities/AudioContext";

/**
 * PodcastDetail component which shows detailed information about a selected podcast
 * with season selection and episode listing
 * 
 * @component
 * 
 * @returns {JSX.Element} The rendered podcast detail page
 */
const PodcastDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    
    const [podcastUrl] = useState("https://podcast-api.netlify.app");
    
    // Fetch all podcasts
    /**
     * Fetch all podcasts data using a custom hook.
     * @typedef {Object} FetchPodcastsResult
     * @property {Array<Object>} data - The array of all podcasts.
     * @property {boolean} isLoading - Indicates if data is currently being fetched.
     * @property {string|null} error - Error message, if fetching fails.
     */
    const { 
        data: allPodcasts,
        isLoading: podcastsLoading, 
        error: podcastsError 
    } = useFetchPodcasts(podcastUrl);

    // State management
    /** @state {Object|null} podcastData - Detailed data of the selected podcast. */
    /** @state {string[]} podcastGenres - List of genre names for the podcast. */
    /** @state {Object|null} selectedSeason - Currently selected season details. */
    /** @state {Array<Object>} currentSeasons - All seasons for the selected podcast. */
    /** @state {boolean} isLoadingSeasons - Indicates if season data is currently being fetched. */
    /** @state {string|null} seasonsError - Stores error message for season fetching. */
    const [podcastData, setPodcastData] = useState(null);
    const [podcastGenres, setPodcastGenres] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [currentSeasons, setCurrentSeasons] = useState([]);
    const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
    const [seasonsError, setSeasonsError] = useState(null);

    // Helper Functions
    /**
     * Finds a podcast by its ID from the list of all podcasts.
     * 
     * @param {string} id - The ID of the podcast.
     * @returns {Object|undefined} The podcast object, if found.
     */
    const getPodcastById = (id) => {
        return allPodcasts.find(podcast => podcast.id === id);
    };

    // Another helper function
    /**
     * Formats a date string into a readable format (e.g., "January 1, 2025").
     * 
     * @param {string} dateString - The date string to format.
     * @returns {string} Formatted date or "Unknown" if invalid.
     */
    const getFormattedDate = (dateString) => {
        if (!dateString) return "Unknown";
        const updatedDate = new Date(dateString);
        return updatedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Fetch seasons data for a specific podcast
    /**
     * Fetches all seasons data for a given podcast.
     * 
     * @async
     * @param {string} podcastId - The podcast ID for which to fetch seasons.
     * @returns {Promise<void>}
     */
    const fetchSeasonsData = async (podcastId) => {
        setIsLoadingSeasons(true);
        setSeasonsError(null);
        
        try {
            const response = await fetch(`https://podcast-api.netlify.app/id/${podcastId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch seasons: ${response.status}`);
            }
            const seasonsData = await response.json();
            
            if (seasonsData && seasonsData.seasons) {
                setCurrentSeasons(seasonsData.seasons);
                // Set first season as default selection
                setSelectedSeason(seasonsData.seasons[0]);
            } else {
                setCurrentSeasons([]);
                setSelectedSeason(null);
            }
        } catch (err) {
            setSeasonsError(err.message);
            console.error('Error fetching seasons:', err);
        } finally {
            setIsLoadingSeasons(false);
        }
    };

    // Fetch genre data for a specific genre ID
    /**
     * Fetches genre data for a specific genre ID.
     * 
     * @async
     * @param {string} genreId - The ID of the genre to fetch.
     * @returns {Promise<Object|null>} The genre data, or null if fetching fails.
     */
    const fetchGenreData = async (genreId) => {
        try {
            const response = await fetch(`https://podcast-api.netlify.app/genre/${genreId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch genre: ${response.status}`);
            }
            const genreData = await response.json();
            return genreData;
        } catch (err) {
            console.error(`Error fetching genre ${genreId}:`, err);
            return null;
        }
    };

    // Fetch all genres for a podcast
    /**
     * Fetches all genre titles for a specific podcast.
     * 
     * @async
     * @param {Object} podcast - The podcast object.
     * @returns {Promise<string[]>} Array of genre titles.
     */
    const fetchAllPodcastGenres = async (podcast) => {
        if (!podcast.genres || podcast.genres.length === 0) return [];
        
        const genrePromises = podcast.genres.map(genreId => 
            fetchGenreData(genreId)
        );
        
        try {
            const genreResults = await Promise.all(genrePromises);
            return genreResults
                .filter(genre => genre !== null)
                .map(genre => genre.title);
        } catch (err) {
            console.error('Error fetching podcast genres:', err);
            return [];
        }
    };

    // Load podcast data and seasons
    useEffect(() => {
        const loadPodcastData = async () => {
            if (id && allPodcasts) {
                const podcast = getPodcastById(id);
                if (podcast) {
                    setPodcastData(podcast);
                    
                    // Fetch genres for this podcast
                    const genreTitles = await fetchAllPodcastGenres(podcast);
                    setPodcastGenres(genreTitles);
                    
                    // Fetch seasons for this podcast
                    await fetchSeasonsData(id);
                }
            }
        };

        loadPodcastData();
    }, [id, allPodcasts]);

    // Handle season selection
    const handleSeasonChange = (event) => {
        const seasonNumber = parseInt(event.target.value);
        const season = currentSeasons.find(s => s.season === seasonNumber);
        setSelectedSeason(season);
    };

    /**
     * Converts time from seconds to "minutes:seconds" format.
     * 
     * @param {number} seconds - Time in seconds.
     * @returns {string} Time in "m:ss" format.
     */
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Episode button component
    /**
     * Component representing a single episode item with play and favorite functionality.
     * 
     * @component
     * 
     * @param {Object} props
     * @param {Object} props.episode - Episode object.
     * @param {number} props.seasonNumber - The season number this episode belongs to.
     * @param {number} props.index - Index of the episode in the list.
     * 
     * @returns {JSX.Element} The rendered episode row.
     */
    const EpisodeButton = ({ episode, seasonNumber, index }) => {
        const [isFavorited, setIsFavorited] = useState(false);
        const { playEpisode, getEpisodeProgress, togglePlayPause, currentEpisode, isPlaying } = useAudio();

        const episodeId = `${podcastData.id}-s${seasonNumber}-e${episode.episode}`;
        const episodeProgress = getEpisodeProgress(episodeId);

        useEffect(() => {
            // Checking if this episode is already favorited
            const savedFavorites = localStorage.getItem('podcastFavorites');
            if (savedFavorites) {
                const favorites = JSON.parse(savedFavorites);
                const isAlreadyFavorited = favorites.some(fav => 
                    fav.episodeId === episodeId
                );
                setIsFavorited(isAlreadyFavorited);
            }
        }, [episodeId]);

        const handlePlayEpisode = () => {
            const episodeData = {
                episodeId: episodeId,
                audioUrl: episode.file, 
                title: episode.title,
                season: seasonNumber,
                episode: episode.episode,
                showTitle: podcastData.title,
                showImage: podcastData.image
            };
            
            // Currently Playing checker
            if (currentEpisode?.episodeId === episodeData.episodeId) {
                // If same episode, just toggle play/pause
                togglePlayPause();
            } else {
                // If different episode, play it (will resume from saved progress)
                playEpisode(episodeData);
            }
        };

        /**
         * Calculates playback progress percentage for an episode.
         * 
         * @returns {number} Progress percentage (0–100).
         */
        const getProgressPercentage = () => {
            if (!episodeProgress || !episodeProgress.duration) return 0;
            return (episodeProgress.currentTime / episodeProgress.duration) * 100;
        };

        const isCurrentlyPlaying = currentEpisode?.episodeId === episodeId;

        /**
         * Adds or removes episode from favorites in localStorage.
         * 
         * @param {React.MouseEvent<HTMLButtonElement>} e - The button click event.
         */
        const handleToggleFavorite = (e) => {
            e.stopPropagation();
            
            const favoriteData = {
                episodeId: episodeId,
                episodeTitle: episode.title,
                episodeDescription: episode.description,
                episodeNumber: episode.episode,
                seasonNumber: seasonNumber,
                showTitle: podcastData.title,
                showImage: podcastData.image,
                audioUrl: episode.file,
                dateAdded: new Date().toISOString()
            };

            const savedFavorites = localStorage.getItem('podcastFavorites');
            let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

            if (isFavorited) {
                // Remove from favorites
                favorites = favorites.filter(fav => fav.episodeId !== favoriteData.episodeId);
            } else {
                // Add to favorites
                favorites.push(favoriteData);
            }

            localStorage.setItem('podcastFavorites', JSON.stringify(favorites));
            setIsFavorited(!isFavorited);
        };

        return (
            <div className="hover:ring-[#9D610E] hover:ring-4 bg-[#fff] flex items-center justify-between p-4 dark:bg-[#181818] rounded-lg dark:hover:bg-[#282828] transition-colors mb-3">
                <div className="flex items-center space-x-4 flex-1 w-[50%]">
                    <div className="lg:flex-shrink-0 lg:w-8 lg:text-center">
                        <span className="hidden lg:text-sm lg:text-gray-500 lg:dark:text-gray-400">
                            {index + 1}
                        </span>
                    </div>
                    <img 
                        src={selectedSeason?.image || podcastData?.image || "/src/assets/SippiCup_logo.png"} 
                        alt="Episode cover" 
                        className="rounded-md w-12 h-12 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                            <span className="font-medium dark:text-white text-[#000] text-sm md:text-base truncate">
                                {episode.title}
                                {isCurrentlyPlaying && (
                                    <span className="ml-2 text-xs text-[#9D610E]">Playing</span>
                                )}
                            </span>
                            <span className="text-xs dark:text-[#b3b3b3] text-[#000] md:ml-4">
                                Episode {episode.episode}
                            </span>
                        </div>
                        <p className="text-xs dark:text-[#b3b3b3] text-[#000] line-clamp-2">
                            {episode.description}
                        </p>

                        {/* Progress indicator */}
                        {episodeProgress && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                    <div 
                                        className="bg-[#9D610E] h-1 rounded-full" 
                                        style={{ width: `${getProgressPercentage()}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>
                                        {episodeProgress.completed ? 'Completed' : `${Math.round(getProgressPercentage())}% played`}
                                    </span>
                                    <span>
                                        {formatTime(episodeProgress.currentTime)} / {formatTime(episodeProgress.duration)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Favorite Button */}
                    <button
                        onClick={handleToggleFavorite}
                        className={`p-2 rounded-full transition-colors ${
                            isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                        }`}
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <svg 
                            className="w-5 h-5" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>

                    {/* Play Button */}
                    <button
                        onClick={handlePlayEpisode}
                        className="ml-4 flex items-center space-x-2 bg-[#65350F] hover:bg-[#1ed760] text-white px-4 py-4 md:py-2 rounded-full text-sm font-medium transition-colors md:min-w-[120px] justify-center"
                    >
                        {isCurrentlyPlaying && isPlaying ? (
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
                                    {isCurrentlyPlaying ? 'Resume' : (episodeProgress ? 'Resume' : 'Listen Now')}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // Handle back navigation
    const handleBackClick = () => {
        navigate(-1);
    };

    const isLoading = podcastsLoading || isLoadingSeasons;
    const error = podcastsError || seasonsError;

    if (isLoading) {
        return <LoadingSpinner message="Loading Podcast Details..." />;
    }

    if (error) {
        return (
            <>
                <div className="min-h-screen dark:bg-[#121212] bg-[#f4f4f4] flex items-center justify-center">
                    <div className="dark:text-[#fff] text-[#000] text-lg text-center">
                        <p>We are experiencing an error, Podcast not found</p>
                        <button 
                            onClick={handleBackClick}
                            className="mt-4 text-[#1DB954] hover:text-[#1ed760]"
                        >
                            Go Back
                        </button>
                    </div>
                    <ErrorDisplay message={`Failed to load podcast data: ${error}`} />
                </div>   
            </>
        );
    }

    if (!podcastData) {
        return (
            <div className="min-h-screen dark:bg-[#121212] bg-[#f4f4f4] flex items-center justify-center">
                <div className="dark:text-[#fff] text-[#000] text-lg text-center">
                    <p>Podcast not found</p>
                    <button 
                        onClick={handleBackClick}
                        className="mt-4 text-[#1DB954] hover:text-[#1ed760]"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen dark:bg-[#121212] dark:text-[#fff] bg-[#f4f4f4] text-[#000]">
            {/* Back Button */}
            <div className="p-4 md:p-8">
                <button 
                    onClick={handleBackClick}
                    className="flex items-center space-x-2 dark:text-[#b3b3b3] text-[#000] dark:hover:text-white hover:text-[#9D610E] mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Podcasts</span>
                </button>
            </div>

            {/* Podcast Header */}
            <div className="max-w-6xl mx-auto mb-8 px-4 md:px-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    {/* Podcast Image */}
                    <img 
                        src={podcastData.image || IMAGES.LOGO} 
                        alt={podcastData.title} 
                        className="w-full md:w-64 h-64 object-cover rounded-lg shadow-lg"
                    />
                    
                    {/* Podcast Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl dark:text-[#b3b3b3] text-[#000] font-bold mb-4">{podcastData.title}</h1>
                        <p className="dark:text-gray-300 text-gray-700 mb-6 leading-relaxed">{podcastData.description}</p>
                        
                        {/* Genres */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {podcastGenres.map((genre, index) => (
                                    <span
                                        key={index}
                                        className="dark:bg-[#F4F4F4] bg-[#b3b3b3] w-fit h-fit px-1 text-sm dark:text-[#121212] text-[#ffffff] truncate"
                                    >
                                        {genre}
                                    </span>
                                ))}
                                {podcastGenres.length === 0 && (
                                    <span className="text-gray-400">No genres listed</span>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm dark:text-gray-300 text-gray-700">
                            <div>
                                <span className="font-medium">Seasons:</span> {currentSeasons.length || 0}
                            </div>
                            <div>
                                <span className="font-medium">Last Updated:</span> {getFormattedDate(podcastData.updated)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seasons Section */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                {/* Loading state for seasons */}
                {/* {isLoadingSeasons && (
                    <div className="text-center py-8">
                        <LoadingSpinner message="Loading Selected Podcast Seasons and Episodes..." />
                    </div>
                )}

                {seasonsError && (
                    <div className="text-center py-8">
                        <div className="text-red-400">Error loading seasons: {seasonsError}</div>
                    </div>
                )} */}

                {/* Season Selector Header */}
                {!isLoadingSeasons && currentSeasons.length > 0 && (
                    <>
                        <div className="flex flex-col mb-6">
                            
                            {/* Season Overview Display */}
                            {currentSeasons.length > 1 && (
                                <div className="mt-8">
                                    <h5 className="text-lg font-medium dark:text-gray-300 text-gray-700 mb-4">All Seasons</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {currentSeasons.map((season, index) => (
                                            <div 
                                                key={season.season}
                                                className={`p-4 hover:ring-[#9D610E] hover:ring-4 bg-[#fff] dark:bg-[#181818] rounded-lg cursor-pointer dark:hover:bg-[#282828] transition-colors ${
                                                    selectedSeason?.season === season.season ? 'ring-4 ring-[#9D610E]' : ''
                                                }`}
                                                onClick={() => setSelectedSeason(season)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0 w-8 text-center">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <img 
                                                        src={season.image || podcastData.image || IMAGES.LOGO} 
                                                        alt={`Season ${season.season} cover`} 
                                                        className="rounded-md w-12 h-12 object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h6 className="font-medium dark:text-white text-[#000] text-sm">
                                                            {season.title || `Season ${season.season}`}
                                                        </h6>
                                                        <p className="text-xs dark:text-[#b3b3b3] text-[#6D6D6D]">
                                                            {season.episodes?.length || 0} episodes
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* <select 
                                value={selectedSeason?.season || ""}
                                onChange={handleSeasonChange}
                                className="w-full md:w-64 px-3 py-2 border bg-white dark:bg-[#282828] text-black dark:text-white px-3 py-2 rounded border border-gray-300 dark:border-[#333] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#65350F] text-sm"
                            >
                                {currentSeasons.map((season) => (
                                    <option 
                                        key={season.season} 
                                        value={season.season}
                                        className="bg-[#282828] text-white"
                                    >
                                        Season {season.season}: {season.title || `Season ${season.season}`}
                                    </option>
                                ))}
                            </select> */}
                        </div>

                        {/* Selected Season Details */}
                        {selectedSeason && (
                            <div className="mb-8">
                                {/* Season Header */}
                                <div className="flex items-start space-x-4 p-4 hover:ring-[#9D610E] hover:ring-4 bg-[#fff] dark:hover:bg-[#65350F] dark:bg-[#282828] items-center justify-between p-4 rounded-lg rounded-lg mb-6">
                                    <img 
                                        src={selectedSeason.image || podcastData.image || IMAGES.LOGO} 
                                        alt={`Season ${selectedSeason.season} cover`} 
                                        className="rounded-md w-16 h-16 md:w-20 md:h-20 object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-lg md:text-xl font-medium dark:text-white text-[#000] mb-2">
                                            {selectedSeason.title || `Season ${selectedSeason.season}`}
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm dark:text-[#b3b3b3] text-[#6D6D6D]">
                                                {selectedSeason.description || `Season ${selectedSeason.season} of ${podcastData.title}`}
                                            </span>
                                            <span className="text-sm font-medium dark:text-[#b3b3b3] text-[#6D6D6D] ml-4">
                                                {selectedSeason.episodes?.length || 0} Episodes
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Episodes List */}
                                <div className="mb-6">
                                    <h5 className="text-lg font-medium dark:text-white text-[#000] mb-4">Episodes</h5>
                                    {selectedSeason.episodes && selectedSeason.episodes.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedSeason.episodes.map((episode, index) => (
                                                <EpisodeButton 
                                                    key={`${selectedSeason.season}-${episode.episode}`}
                                                    index={index}
                                                    episode={episode} 
                                                    seasonNumber={selectedSeason.season}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            No episodes available for this season.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* No Seasons Available */}
                {!isLoadingSeasons && currentSeasons.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No season data available for this podcast.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PodcastDetail;