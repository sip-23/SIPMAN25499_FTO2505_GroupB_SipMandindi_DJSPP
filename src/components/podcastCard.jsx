import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

/**
 * This component builds and renders a podcast card with image, title, genres, seasons, and last updated date.
 */
const PodcastCard = ({ podcast }) => {
    const navigate = useNavigate();
    const [genreTitles, setGenreTitles] = useState([]);
    const [isLoadingGenres, setIsLoadingGenres] = useState(false);

    // Fetch genre data from API endpoint: https://podcast-api.netlify.app/genre/{ID}
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

    // Fetch all genres for this podcast
    const fetchPodcastGenres = async () => {
        if (!podcast.genres || podcast.genres.length === 0) {
            setGenreTitles([]);
            return;
        }

        setIsLoadingGenres(true);
        
        try {
            const genrePromises = podcast.genres.map(genreId => 
                fetchGenreData(genreId)
            );
            
            const genreResults = await Promise.all(genrePromises);
            const titles = genreResults
                .filter(genre => genre !== null)
                .map(genre => genre.title);
            
            setGenreTitles(titles);
        } catch (err) {
            console.error('Error fetching podcast genres:', err);
            setGenreTitles([]);
        } finally {
            setIsLoadingGenres(false);
        }
    };

    useEffect(() => {
        fetchPodcastGenres();
    }, [podcast.genres]);

    const getFormattedDate = (dateString) => {
        const updatedDate = new Date(dateString);
        return updatedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleClick = () => {
        // To allow me to Navigate to detail page of selected Podcast ID
        navigate(`/podcast/${podcast.id}`);
    };

    return (
        <div 
            className="podcast-card min-w-[280px] max-w-[285px] max-h-[350px] flex flex-col p-5 gap-1 rounded-lg bg-[#282828] hover:bg-[#65350F] transition-colors cursor-pointer"
            onClick={handleClick}
        >
            <img 
                src={podcast.image} 
                alt={podcast.title} 
                className="podcast-image rounded-md w-[240px] h-[190px] object-cover mb-2"
            />

            <div className="flex items-center justify-between">
                <h3 className="title font-semibold text-white truncate">{podcast.title}</h3>
            </div>

            <div className="flex items-center justify-start gap-2">
                <svg className="fill-[#b3b3b3]" xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 100.353 100.353">
                </svg>
                <span className="season-info text-sm text-[#b3b3b3] truncate">
                {podcast.seasons || 0} seasons
                </span>
            </div>

            <div className="mb-1">
                <div className="flex flex-wrap gap-1">
                    {isLoadingGenres ? (
                        <span className="genre-tag bg-[#F4F4F4] rounded-[2px] w-fit px-1 text-sm text-[#121212] truncate">
                            Loading...
                        </span>
                    ) : (
                        genreTitles.map((genre, index) => (
                            <span
                                key={index}
                                className="genre-tag bg-[#F4F4F4] rounded-[2px] w-fit px-1 text-sm text-[#121212] truncate"
                            >
                                {genre}
                            </span>
                        ))
                    )}
                    {!isLoadingGenres && genreTitles.length === 0 && (
                        <span className="genre-tag bg-[#F4F4F4] rounded-[2px] w-fit px-1 text-sm text-[#121212] truncate">
                            No genres
                        </span>
                    )}
                </div>
            </div>

            <p className="update-info text-sm text-[#b3b3b3] truncate">
                {getFormattedDate(podcast.updated)}
            </p>
        </div>
    );
};

export default PodcastCard;