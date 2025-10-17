import { useState, useRef, useEffect, useMemo } from "react";
import PodcastCard from "../components/PodcastCard.jsx";
import { useLayout } from "../layouts/LayoutContext.jsx";

const RenderRow = ({ title, podcasts, onPodcastSelect, isRecommendationRow = false }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const { isSidebarOpen } = useLayout();

    // Generate randomized podcasts with session persistence for recommendation rows
    const displayPodcasts = useMemo(() => {
        if (!podcasts || podcasts.length === 0) return [];
        
        // For recommendation rows, use randomization with session persistence
        if (isRecommendationRow) {
            // Get or create session key for persistence
            const sessionKey = `recommendation_randomized_${title.replace(/\s+/g, '_').toLowerCase()}`;
            const stored = sessionStorage.getItem(sessionKey);
            
            if (stored) {
                // Use stored randomized order for this session
                const storedIds = JSON.parse(stored);
                return storedIds.map(id => podcasts.find(podcast => podcast.id === id)).filter(Boolean);
            } else {
                // Create new randomized order, limit to 10 podcasts for recommendations
                const shuffled = [...podcasts]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 10);
                
                // Store the IDs in sessionStorage
                const podcastIds = shuffled.map(podcast => podcast.id);
                sessionStorage.setItem(sessionKey, JSON.stringify(podcastIds));
                
                return shuffled;
            }
        }
        
        // For non-recommendation rows, return original podcasts
        return podcasts;
    }, [podcasts, title, isRecommendationRow]);

    // Calculate dynamic scroll amount based on sidebar state and screen size
    const getScrollAmount = () => {
        if (typeof window === 'undefined') return 300;
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            return 280; // Mobile
        } else if (screenWidth < 1024) {
            return isSidebarOpen ? 320 : 350; // Tablet
        } else {
            return isSidebarOpen ? 350 : 400; // Desktop
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = getScrollAmount();
            
            // Check if we're at the end
            const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 10);
            
            if (isAtEnd) {
                // Loop back to start
                container.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                // Normal scroll
                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = getScrollAmount();
            
            // Check if we're at the beginning
            const isAtStart = container.scrollLeft <= 10;
            
            if (isAtStart) {
                // Loop to end
                container.scrollTo({
                    left: container.scrollWidth,
                    behavior: 'smooth'
                });
            } else {
                // Normal scroll
                container.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    };

    const updateButtonVisibility = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollLeft = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            
            // Always show both buttons for continuous loop, but adjust opacity based on position
            setShowLeftButton(true);
            setShowRightButton(true);
        }
    };

    // Calculate number of visible cards based on sidebar state
    const getVisibleCardCount = () => {
        if (typeof window === 'undefined') return 3;
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            return 1; // Mobile: show 1 card
        } else if (screenWidth < 1024) {
            return isSidebarOpen ? 2 : 3; // Tablet: 2 with sidebar, 3 without
        } else {
            return isSidebarOpen ? 3 : 4; // Desktop: 3 with sidebar, 4 without
        }
    };

    // Adjust container padding based on visible cards
    const getContainerPadding = () => {
        const visibleCards = getVisibleCardCount();
        if (visibleCards >= 4) return 'px-2';
        if (visibleCards === 3) return 'px-4';
        return 'px-6';
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', updateButtonVisibility);
            window.addEventListener('resize', updateButtonVisibility);
            
            // Initial check
            updateButtonVisibility();

            return () => {
                container.removeEventListener('scroll', updateButtonVisibility);
                window.removeEventListener('resize', updateButtonVisibility);
            };
        }
    }, [displayPodcasts, isSidebarOpen]);

    // Reset and update when sidebar state changes
    useEffect(() => {
        const timer = setTimeout(updateButtonVisibility, 300);
        return () => clearTimeout(timer);
    }, [displayPodcasts, isSidebarOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                scrollLeft();
            } else if (e.key === 'ArrowRight') {
                scrollRight();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!displayPodcasts || displayPodcasts.length === 0) {
        return null;
    }

    const visibleCardCount = getVisibleCardCount();
    const containerPadding = getContainerPadding();

    return (
        <div className="flex flex-col mb-8 w-full">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4 px-4">
                {title}
                <span className="text-sm text-gray-500 ml-2 font-normal">
                    ({displayPodcasts.length} {isRecommendationRow ? 'recommended' : 'shows'})
                </span>
            </h1>
            
            <div className="flex items-center relative group">
                {/* Left Scroll Button with improved styling */}
                <button 
                    onClick={scrollLeft}
                    className={`absolute left-0 z-10 p-3 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 
                              transition-all duration-200 ml-2 transform hover:scale-110
                              ${showLeftButton ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                    aria-label="Scroll left"
                    disabled={!showLeftButton}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </button>

                {/* Podcasts Container with dynamic sizing */}
                <div 
                    ref={scrollContainerRef}
                    className={`flex items-center gap-4 w-full overflow-x-auto scrollbar-hide scroll-smooth py-3 ${containerPadding}
                              transition-all duration-300 ease-in-out`}
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                        // Dynamic max width based on sidebar state
                        maxWidth: isSidebarOpen ? 'calc(100vw - 25rem)' : '100vw'
                    }}
                >
                    {displayPodcasts.map((podcast, index) => (
                        <div 
                            key={podcast.id} 
                            className="flex-shrink-0 transition-transform duration-200 hover:scale-105"
                            style={{
                                // Dynamic card width based on visible count
                                minWidth: `calc(${100 / visibleCardCount}% - 1rem)`,
                                maxWidth: `calc(${100 / visibleCardCount}% - 1rem)`
                            }}
                        >
                            <PodcastCard
                                podcast={podcast}
                                onPodcastSelect={onPodcastSelect}
                            />
                        </div>
                    ))}
                </div>

                {/* Right Scroll Button with improved styling */}
                <button 
                    onClick={scrollRight}
                    className={`absolute right-0 z-10 p-3 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 
                              transition-all duration-200 mr-2 transform hover:scale-110
                              ${showRightButton ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                    aria-label="Scroll right"
                    disabled={!showRightButton}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                </button>

                {/* Scroll indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {Array.from({ length: Math.min(5, displayPodcasts.length) }).map((_, index) => (
                        <div 
                            key={index}
                            className="w-2 h-2 bg-gray-400 rounded-full opacity-50"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RenderRow;