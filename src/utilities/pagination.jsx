import { useState, useEffect } from "react";

/**
 * Pagination Component
 * 
 * The count or numbered pages with navigation buttons
 * @component
 */
const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalPosts, 
    postsPerPage, 
    onPageChange 
}) => {
    const [pageNumbers, setPageNumbers] = useState([]);

    // Calculating visible page numbers at the bottom: 1, 2, 3, ... 7
    useEffect(() => {
        const numbers = [];
        const maxVisiblePages = 3;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            numbers.push(i);
        }
        
        setPageNumbers(numbers);
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    const startPost = (currentPage - 1) * postsPerPage + 1;
    const endPost = Math.min(currentPage * postsPerPage, totalPosts);

    return (
        <div className="flex flex-col items-center justify-between gap-4 mt-8 sm:flex-row">
            {/* Results info */}
            <div className="text-[#b3b3b3] text-sm">
                Showing {startPost}-{endPost} of {totalPosts} results
            </div>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-[#b3b3b3] bg-[#282828] rounded-md hover:bg-[#65350F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                {/* First page */}
                {pageNumbers[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                1 === currentPage 
                                    ? 'bg-[#65350F] text-white' 
                                    : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#65350F] hover:text-white'
                            }`}
                        >
                            1
                        </button>
                        {pageNumbers[0] > 2 && <span className="px-2 text-[#b3b3b3]">...</span>}
                    </>
                )}

                {/* Page numbers */}
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            number === currentPage 
                                ? 'bg-[#65350F] text-white' 
                                : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#65350F] hover:text-white'
                        }`}
                    >
                        {number}
                    </button>
                ))}

                {/* Last page */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                            <span className="px-2 text-[#b3b3b3]">...</span>
                        )}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                totalPages === currentPage 
                                    ? 'bg-[#65350F] text-white' 
                                    : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#65350F] hover:text-white'
                            }`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-[#b3b3b3] bg-[#282828] rounded-md hover:bg-[#65350F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;