import { useState, useRef, useEffect } from "react";
import PodcastCard from "../components/podcastCard";

const RenderRow = ({ title, podcasts, onPodcastSelect }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

    const scrollAmount = 290;

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const updateButtonVisibility = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            setShowLeftButton(container.scrollLeft > 0);
            setShowRightButton(
                container.scrollLeft < (container.scrollWidth - container.clientWidth - 10)
            );
        }
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
    }, [podcasts]);

    if (!podcasts || podcasts.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col mb-8">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-6">{title}</h1>
            <div className="flex items-center mb-6">
                {/* Left Scroll Button */}
                {showLeftButton && (
                    <button 
                        onClick={scrollLeft}
                        className="p-1 lg:p-4 transition-opacity duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24">
                            <g>
                                <path fill="#b3b3b3" d="M0 0h24v24H0z"/>
                                <path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z" fill="#b3b3b3"/>
                            </g>
                        </svg>
                    </button>
                )}

                {/* Podcasts Container */}
                <div 
                    ref={scrollContainerRef}
                    className="flex items-center gap-6 w-full flex-1 flex-shrink-0 h-[370px] px-1 py-2 overflow-x-auto scrollbar-hide"
                >
                    {podcasts.map(podcast => (
                        <PodcastCard
                            key={podcast.id}
                            podcast={podcast}
                            onPodcastSelect={onPodcastSelect}
                        />
                    ))}
                </div>

                {/* Right Scroll Button */}
                {showRightButton && (
                    <button 
                        onClick={scrollRight}
                        className="p-1 lg:p-4 transition-opacity duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24">
                            <g>
                                <path fill="#b3b3b3" d="M0 0h24v24H0z"/>
                                <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="#b3b3b3"/>
                            </g>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default RenderRow;