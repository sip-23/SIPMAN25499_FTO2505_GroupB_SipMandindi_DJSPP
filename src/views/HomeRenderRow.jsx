import { useState, useRef, useEffect, useMemo } from "react";
import PodcastCard from "../components/PodcastCard.jsx";
import { useLayout } from "../layouts/LayoutContext.jsx"; 

const HomeRenderRow = ({ title, allPodcasts, onPodcastSelect }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const { isSidebarOpen } = useLayout();

    // Generate randomized podcasts with session persistence
    const randomizedPodcasts = useMemo(() => {
        if (!allPodcasts || allPodcasts.length === 0) return [];
        
        // Get or create session key for persistence
        const sessionKey = `homepage_randomized_${title.replace(/\s+/g, '_').toLowerCase()}`;
        const stored = sessionStorage.getItem(sessionKey);
        
        if (stored) {
            // Use stored randomized order for this session
            const storedIds = JSON.parse(stored);
            return storedIds.map(id => allPodcasts.find(podcast => podcast.id === id)).filter(Boolean);
        } else {
            // Create new randomized order
            const shuffled = [...allPodcasts]
                .sort(() => Math.random() - 0.5)
                .slice(0, 10); // Show 10 random podcasts
            
            // Store the IDs in sessionStorage
            const podcastIds = shuffled.map(podcast => podcast.id);
            sessionStorage.setItem(sessionKey, JSON.stringify(podcastIds));
            
            return shuffled;
        }
    }, [allPodcasts, title]);

    // Clear session storage when component unmounts or on page refresh
    useEffect(() => {
        return () => {
            
        };
    }, []);

    // Scroll functions (same as your existing RenderRow)
    const getScrollAmount = () => {
        if (typeof window === 'undefined') return 300;
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            return 280;
        } else if (screenWidth < 1024) {
            return isSidebarOpen ? 320 : 350;
        } else {
            return isSidebarOpen ? 350 : 400;
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
            setShowLeftButton(true);
            setShowRightButton(true);
        }
    };

    const getVisibleCardCount = () => {
        if (typeof window === 'undefined') return 3;
        
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            return 1;
        } else if (screenWidth < 1024) {
            return isSidebarOpen ? 2 : 3;
        } else {
            return isSidebarOpen ? 3 : 4;
        }
    };

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
            updateButtonVisibility();

            return () => {
                container.removeEventListener('scroll', updateButtonVisibility);
                window.removeEventListener('resize', updateButtonVisibility);
            };
        }
    }, [randomizedPodcasts, isSidebarOpen]);

    useEffect(() => {
        const timer = setTimeout(updateButtonVisibility, 300);
        return () => clearTimeout(timer);
    }, [randomizedPodcasts, isSidebarOpen]);

    if (!randomizedPodcasts || randomizedPodcasts.length === 0) {
        return null;
    }

    const visibleCardCount = getVisibleCardCount();
    const containerPadding = getContainerPadding();

    return (
        <div className="flex flex-col mb-8 lg:w-[92%] w-full">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4 px-4">
                {title}
                <span className="text-sm text-gray-500 ml-2 font-normal">
                    ({randomizedPodcasts.length} shows)
                </span>
            </h1>
            
            <div className="flex items-center relative group">
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

                <div 
                    ref={scrollContainerRef}
                    className={`flex items-center gap-4 w-full overflow-x-auto scrollbar-hide scroll-smooth py-3 ${containerPadding}
                              transition-all duration-300 ease-in-out`}
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                        maxWidth: isSidebarOpen ? 'calc(100vw - 25rem)' : '100vw'
                    }}
                >
                    {randomizedPodcasts.map((podcast) => (
                        <div 
                            key={podcast.id} 
                            className="flex-shrink-0 transition-transform duration-200 hover:scale-105"
                            style={{
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
            </div>
        </div>
    );
};

export default HomeRenderRow;