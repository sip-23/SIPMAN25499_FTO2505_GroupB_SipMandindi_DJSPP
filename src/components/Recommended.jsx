import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RenderRow from "../views/RenderRows";
import { useFetchPodcasts } from "../utilities/fetchPodcasts";
import { useLayout } from "../layouts/LayoutContext.jsx";

const Recommended = () => {
    const [recommendations, setRecommendations] = useState({});
    const [allPodcasts, setAllPodcasts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Use layout context
    const { 
        isSidebarOpen, 
        isMobileSidebarOpen, 
        closeMobileSidebar,
        openMobileSidebar 
    } = useLayout();

    // Fetch all podcasts
    const { data: fetchedPodcasts } = useFetchPodcasts("https://podcast-api.netlify.app");

    useEffect(() => {
        if (fetchedPodcasts) {
            setAllPodcasts(fetchedPodcasts);
        }
    }, [fetchedPodcasts]);

    // Generate recommendations based on favorite genres
    useEffect(() => {
        if (allPodcasts.length === 0) return;

        const savedFavorites = localStorage.getItem('podcastFavorites');
        if (!savedFavorites) {
            setRecommendations({});
            return;
        }

        const favorites = JSON.parse(savedFavorites);
        console.log('Favorites for recommendations:', favorites);

        // Get unique show IDs from favorites
        const favoriteShowIds = [...new Set(favorites.map(fav => {
            // Extract podcast ID from episodeId (format: "podcastId-sX-eX")
            const match = fav.episodeId.match(/^([^-]+)-s\d+-e\d+$/);
            return match ? match[1] : null;
        }))].filter(Boolean);

        console.log('Favorite show IDs:', favoriteShowIds);

        // Get genres from favorite shows
        const favoriteGenres = new Set();
        favoriteShowIds.forEach(showId => {
            const show = allPodcasts.find(podcast => podcast.id === showId);
            if (show && show.genres) {
                show.genres.forEach(genreId => favoriteGenres.add(genreId));
            }
        });

        console.log('Favorite genres:', Array.from(favoriteGenres));

        // Fetch genre names and create recommendations
        const generateRecommendations = async () => {
            const genreRecommendations = {};

            for (const genreId of favoriteGenres) {
                try {
                    // Fetch genre name
                    const genreResponse = await fetch(`https://podcast-api.netlify.app/genre/${genreId}`);
                    if (genreResponse.ok) {
                        const genreData = await genreResponse.json();
                        const genreName = genreData.title;

                        // Find podcasts with this genre that are NOT already favorited
                        const recommendedPodcasts = allPodcasts.filter(podcast => 
                            podcast.genres && 
                            podcast.genres.includes(genreId) && 
                            !favoriteShowIds.includes(podcast.id)
                        );

                        if (recommendedPodcasts.length > 0) {
                            genreRecommendations[genreName] = recommendedPodcasts;
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching genre ${genreId}:`, error);
                }
            }

            console.log('Generated recommendations:', genreRecommendations);
            setRecommendations(genreRecommendations);
        };

        generateRecommendations();
    }, [allPodcasts]);

    const handleSearch = (term) => {
        console.log('Search term:', term);
    };

    const handlePodcastSelect = (podcast) => {
        console.log('Selected podcast:', podcast);
    };


    return (
        <>
            <Header onSearch={handleSearch} searchTerm={searchTerm}  />

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className="xl:relative sm:fixed  dark:bg-[#1a1a1a] bg-[#F4F4F4] bg-opacity-50 z-30 lg:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            <div className="min-h-screen flex flex-col xl:flex-row">
                {/* Sidebar -  */}
                <div className={`${isMobileSidebarOpen ? 'sm:absolute sm:inset-x-0  flex items-center justify-center z-40' : 'hidden'}`}>
                    <Sidebar />
                </div>
            
                {/* Main Content */}
                <div className={`relative w-full dark:text-white text-[#000] dark:bg-[#1a1a1a] bg-[#F4F4F4] p-4 lg:p-6 ${
                    isSidebarOpen ? 'xl:border-l xl:border-gray-300 xl:dark:border-[#333]' : ''
                }`}>
                    <div className="w-full flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-6">Recommended For You</h1>

                        
                        <div className="mb-4 p-2 bg-yellow-900 text-yellow-200 rounded text-sm">
                            Found {Object.keys(recommendations).length} genre recommendations
                        </div>

                        {Object.keys(recommendations).length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 mb-4 text-lg">
                                    {allPodcasts.length === 0 
                                        ? "Loading podcasts..." 
                                        : "No recommendations yet. Start favoriting episodes to get personalized recommendations!"
                                    }
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Recommendations are based on the genres of shows you've favorited.
                                </p>
                            </div>
                        ) : (
                            Object.keys(recommendations).map(genreName => (
                                <RenderRow
                                    key={genreName}
                                    title={`Because you like ${genreName}`}
                                    podcasts={recommendations[genreName]}
                                    onPodcastSelect={handlePodcastSelect}
                                />
                            ))
                        )}

                        {/* Fallback: Show popular podcasts if no genre-based recommendations */}
                        {Object.keys(recommendations).length === 0 && allPodcasts.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-6">Popular Podcasts</h2>
                                <RenderRow
                                    title="Trending Now"
                                    podcasts={allPodcasts.slice(0, 10)} // Show first 10 podcasts
                                    onPodcastSelect={handlePodcastSelect}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Recommended;