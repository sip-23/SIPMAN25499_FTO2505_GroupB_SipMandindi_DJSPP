import { useState, useRef, useEffect, useMemo } from "react";
import PodcastCard from "../components/podcastCard.jsx";
import { useLayout } from "../layouts/LayoutContext.jsx";

/**
 * @description 
 * This component renders a horizontally scrollable row of podcast cards with 
 * responsive sizing, adaptive behavior based on screen size and sidebar state,
 * and persistent randomization for recommendation rows. It includes smooth scrolling, 
 * arrow key navigation, and visual scroll indicators.
 * * Renders a row of podcast cards with scroll controls, adaptive card widths, 
 * and session-persistent recommendations.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.title - The title displayed above the podcast row.
 * @param {Array<Object>} props.podcasts - Array of podcast objects to display.
 * Each podcast object is expected to include at least an `id` property.
 * @param {Function} props.onPodcastSelect - Callback function triggered when a podcast is selected.
 * @param {boolean} [props.isRecommendationRow=false] - Flag indicating whether the row should display
 * randomized and session-persistent recommended podcasts.
 * 
 * @returns {JSX.Element|null} A responsive, scrollable row of podcast cards with dynamic behavior.
 */
const RenderRow = ({ title, podcasts, onPodcastSelect, isRecommendationRow = false }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const { isSidebarOpen } = useLayout();

    // Generate randomized podcasts with session persistence for recommendation rows
    const displayPodcasts = useMemo(() => {
        if (!podcasts || podcasts.length === 0) return [];
        
        if (isRecommendationRow) {
            const sessionKey = `recommendation_randomized_${title.replace(/\s+/g, '_').toLowerCase()}`;
            const stored = sessionStorage.getItem(sessionKey);
            
            if (stored) {
                const storedIds = JSON.parse(stored);
                return storedIds.map(id => podcasts.find(podcast => podcast.id === id)).filter(Boolean);
            } else {
                const shuffled = [...podcasts]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 10);
                
                const podcastIds = shuffled.map(podcast => podcast.id);
                sessionStorage.setItem(sessionKey, JSON.stringify(podcastIds));
                
                return shuffled;
            }
        }
        
        return podcasts;
    }, [podcasts, title, isRecommendationRow]);

    // Calculate dynamic scroll amount based on card width
    const getScrollAmount = () => {
        const cardWidth = getCardWidth();
        const visibleCards = getVisibleCardCount();
        return cardWidth * visibleCards * 0.8; // Scroll 80% of visible area
    };

    // Calculate card width based on screen size and sidebar state
    const getCardWidth = () => {
        if (typeof window === 'undefined') return 280;
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 640) { // Mobile
            return screenWidth - 80; // Full width minus padding
        } else if (screenWidth < 768) { // Small tablet
            return 300;
        } else if (screenWidth < 1024) { // Tablet
            return isSidebarOpen ? 280 : 240;
        } else { // Desktop
            return isSidebarOpen ? 260 : 220;
        }
    };

    // Calculate number of visible cards based on sidebar state
    const getVisibleCardCount = () => {
        if (typeof window === 'undefined') return 3;
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 640) {
            return 1; // Mobile: show 1 card
        } else if (screenWidth < 768) {
            return 1.5; // Small tablet: show 1.5 cards (peek)
        } else if (screenWidth < 1024) {
            return isSidebarOpen ? 2.2 : 2.8; // Tablet
        } else {
            return isSidebarOpen ? 3.2 : 4.2; // Desktop
        }
    };

    // Calculate gap size based on screen size
    const getGapSize = () => {
        if (typeof window === 'undefined') return 16;
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 640) return 12; // Mobile
        if (screenWidth < 768) return 14; // Small tablet
        if (screenWidth < 1024) return 16; // Tablet
        return 20; // Desktop
    };

    // Calculate container padding based on screen size
    const getContainerPadding = () => {
        if (typeof window === 'undefined') return 'px-4';
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 640) return 'px-4'; // Mobile
        if (screenWidth < 768) return 'px-4'; // Small tablet
        if (screenWidth < 1024) return 'px-6'; // Tablet
        return 'px-8'; // Desktop
    };

    // Get container max width based on sidebar state
    const getContainerMaxWidth = () => {
        if (typeof window === 'undefined') return '100%';
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 1024) {
            return '100%';
        } else {
            return isSidebarOpen ? 'calc(100vw - 25rem)' : '100%';
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = getScrollAmount();
            
            const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 10);
            
            if (isAtEnd) {
                container.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
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
            
            const isAtStart = container.scrollLeft <= 10;
            
            if (isAtStart) {
                container.scrollTo({
                    left: container.scrollWidth,
                    behavior: 'smooth'
                });
            } else {
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
            
            // Show buttons based on scroll position
            setShowLeftButton(scrollLeft > 10);
            setShowRightButton(scrollLeft < (scrollWidth - clientWidth - 10));
        }
    };

    // Get dynamic styles for cards
    const getCardStyles = () => {
        const cardWidth = getCardWidth();
        const gapSize = getGapSize();
        
        return {
            minWidth: `${cardWidth}px`,
            maxWidth: `${cardWidth}px`,
            marginRight: `${gapSize}px`
        };
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', updateButtonVisibility);
            window.addEventListener('resize', updateButtonVisibility);
            
            updateButtonVisibility();

            return () => {
                container.removeEventListener('scroll', updateButtonVisibility);
                window.removeEventListener('resize', updateButtonVisibility);
            };
        }
    }, [displayPodcasts, isSidebarOpen]);

    useEffect(() => {
        const timer = setTimeout(updateButtonVisibility, 300);
        return () => clearTimeout(timer);
    }, [displayPodcasts, isSidebarOpen]);

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

    const containerPadding = getContainerPadding();
    const gapSize = getGapSize();
    const containerMaxWidth = getContainerMaxWidth();

    return (
        <div className="flex flex-col mb-8 w-full">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4 px-4 md:px-6">
                {title}
                <span className="text-sm text-gray-500 ml-2 font-normal">
                    ({displayPodcasts.length} {isRecommendationRow ? 'recommended' : 'shows'})
                </span>
            </h1>
            
            <div className="flex items-center relative group w-full">
                {/* Left Scroll Button */}
                <button 
                    onClick={scrollLeft}
                    className={`absolute left-0 z-10 p-2 md:p-3 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 
                              transition-all duration-200 ml-2 md:ml-4 transform hover:scale-110
                              ${showLeftButton ? 'opacity-100' : 'opacity-0 cursor-not-allowed'}`}
                    aria-label="Scroll left"
                    disabled={!showLeftButton}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </button>

                {/* Podcasts Container with fixed pixel widths */}
                <div 
                    ref={scrollContainerRef}
                    className={`flex items-start w-full overflow-x-auto scrollbar-hide scroll-smooth py-3 ${containerPadding}
                              transition-all duration-300 ease-in-out`}
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                        gap: `${gapSize}px`,
                        maxWidth: containerMaxWidth
                    }}
                >
                    {displayPodcasts.map((podcast, index) => (
                        <div 
                            key={podcast.id} 
                            className="flex-shrink-0 transition-transform duration-200 hover:scale-105"
                            style={getCardStyles()}
                        >
                            <PodcastCard
                                podcast={podcast}
                                onPodcastSelect={onPodcastSelect}
                            />
                        </div>
                    ))}
                </div>

                {/* Right Scroll Button */}
                <button 
                    onClick={scrollRight}
                    className={`absolute right-0 z-10 p-2 md:p-3 bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 
                              transition-all duration-200 mr-2 md:mr-4 transform hover:scale-110
                              ${showRightButton ? 'opacity-100' : 'opacity-0 cursor-not-allowed'}`}
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