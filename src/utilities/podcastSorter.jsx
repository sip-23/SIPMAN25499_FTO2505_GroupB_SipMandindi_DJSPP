import { useState } from "react";

/**
 * Sorter Component
 * Provides date-based sorting for podcasts
 * @component
 */
const Sorter = ({ onSortChange }) => {
    const [sortCriteria, setSortCriteria] = useState('desc');

    // Sort options configuration
    const sortOptions = [
        { value: 'recent', label: 'Newest: Recently updated' },
        { value: 'oldest', label: 'Oldest: GrandPa & GrandMa' },
        { value: 'title-az', label: 'A - Z: Alphabetical order' },
        { value: 'title-za', label: 'Z - A: Alphabetical order' },
        { value: 'seasons', label: '# Seasons: Number of seasons' }
    ];

    // Handle sort order change
    const handleSortChange = (event) => {
        const criteria = event.target.value;
        setSortCriteria(criteria);
        onSortChange(criteria);
    };

    return (
        <div className="flex items-center justify-start gap-3 mb-6 mt-6">
            <h4 className="font-medium text-[#fff] text-[15px]">Sort by:</h4>
            <div className="flex items-center relative">
                <select 
                    id="podcast-sorter"
                    value={sortCriteria}
                    onChange={handleSortChange}
                    className="w-full px-2 py-2 font-plus-jakarta-sans border text-[13px] font-medium border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 text-[#000112] [&>option:checked]:text-black"
                >
                    {sortOptions.map(option => (
                        <option 
                            key={option.value} 
                            value={option.value}
                            className="bg-white text-[13px] font-medium text-gray-400 hover:bg-gray-900"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Sorter;