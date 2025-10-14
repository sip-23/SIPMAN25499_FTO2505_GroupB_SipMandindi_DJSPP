import { useState, useEffect } from "react";

/**
 * GenreFilter Component
 * Provides genre-based filtering for podcasts
 * @component
 */
const GenreFilter = ({ onGenreChange }) => {
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all genres from provided API endpoint: https://podcast-api.netlify.app/genre/{ID}
    const fetchAllGenres = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Fetching the known genre IDs
            const genreIds = [1, 2, 3, 4, 5, 6, 7, 8, 9]; 
            const genrePromises = genreIds.map(genreId => 
                fetch(`https://podcast-api.netlify.app/genre/${genreId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch genre ${genreId}: ${response.status}`);
                        }
                        return response.json();
                    })
            );
            
            const genreResults = await Promise.all(genrePromises);
            setGenres(genreResults);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching genres:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllGenres();
    }, []);

    // Handling genre selection change
    const handleGenreChange = (event) => {
        const genreId = event.target.value;
        setSelectedGenre(genreId);
        onGenreChange(genreId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-start gap-3 mb-6 mt-6">
                <h4 className="font-medium text-[#fff] text-[15px]">Filter by:</h4>
                <div className="flex items-center relative">
                    <select 
                        disabled
                        className="w-full px-2 py-2 font-plus-jakarta-sans border text-[13px] font-medium border-gray-300 rounded-md shadow-sm text-[#000112]"
                    >
                        <option>Loading genres...</option>
                    </select>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-start gap-3 mb-6 mt-6">
                <h4 className="font-medium text-[#fff] text-[15px]">Filter by:</h4>
                <div className="flex items-center relative">
                    <select 
                        disabled
                        className="w-full px-2 py-2 font-plus-jakarta-sans border text-[13px] font-medium border-gray-300 rounded-md shadow-sm text-[#000112]"
                    >
                        <option>Error loading genres</option>
                    </select>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-start gap-3 mb-6 mt-6">
            <h4 className="font-medium text-[#fff] text-[15px]">Filter by:</h4>
            <div className="flex items-center relative">
                <select 
                    id="genre-filter"
                    value={selectedGenre}
                    onChange={handleGenreChange}
                    className="w-full px-2 py-2 font-plus-jakarta-sans border text-[13px] font-medium border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 text-[#000112] [&>option:checked]:text-black"
                >
                    <option value="all" className="bg-white text-[13px] font-medium text-gray-400 hover:bg-gray-900">
                        All Genres
                    </option>
                    {genres.map(genre => (
                        <option 
                            key={genre.id} 
                            value={genre.id}
                            className="bg-white text-[13px] font-medium text-gray-400 hover:bg-gray-900"
                        >
                            {genre.title}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default GenreFilter;