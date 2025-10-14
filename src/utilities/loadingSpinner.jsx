import { IMAGES } from "../data/images";

/**
 * LoadingSpinner Component
 * 
 * Displays a full-screen loading overlay with:
 * - A spinning circular loader
 * - A welcome message
 * - Sippi-Cup logo
 *
 * @component
 */
const LoadingSpinner = ({ message = "Loading Podcasts..." }) => {

    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white z-[1000]">
            <div className="border-[5px] border-solid border-gray-300 border-t-[5px] border-t-blue-500 rounded-full w-[50px] h-[50px] mb-4 animate-spin"></div>
                <p className="mb-4">Welcome to Sippi-Cup ☕ Podcasts</p>

                {IMAGES.LOGO && (
                    <img 
                        className="flex w-[200px] h-fit md:w-[200px] mb-4" 
                        src={IMAGES.LOGO} 
                        alt="Sippi-Cup Logo"
                    />
                )}

                <p>{message}</p>
            </div>
    );
};

export default LoadingSpinner;