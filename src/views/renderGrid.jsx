import PodcastCard from '../components/podcastCard';

/**
 * PodcastGrid component renders a responsive grid of PodcastCard components creating a grid layout.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object[]} props.podcasts - Array of podcast objects.
 * @param {string} props.podcasts[].id - Unique id.
 * @param {string} props.podcasts[].title - Podcast title.
 * @param {string} props.podcasts[].image - Podcast image URL.
 * @param {string[]} [props.podcasts[].genres] - Array of genre IDs
 * @param {number} [props.podcasts[].seasons] - Number of seasons.
 * @param {string} props.podcasts[].updated - Date string of last update.
 *
 * @returns {JSX.Element} A responsive grid of podcast cards or a message if no podcasts are found.
 */
const PodcastGrid = ({ podcasts, isSidebarOpen = true }) => {
  if (!podcasts || podcasts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No podcasts found
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 place-items-center place-content-center ${
      isSidebarOpen 
        ? 'sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
        : 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    } gap-6 `}>
      {podcasts.map(podcast => (
        <PodcastCard
          key={podcast.id}
          podcast={podcast}
        />
      ))}
    </div>
  );
};

export default PodcastGrid;