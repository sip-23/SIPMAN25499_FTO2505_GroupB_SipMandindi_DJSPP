import React, { useState, useRef, useEffect } from 'react'; 
import { useAudio } from '../utilities/AudioContext';

const GlobalAudioPlayer = () => {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeatActive,
    isShuffleActive,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    stopPlayback
  } = useAudio();

  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);

  // Before unload confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isPlaying) {
        e.preventDefault();
        e.returnValue = 'You have audio playing. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current || !currentEpisode) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const width = rect.width;
    
    const newTime = (clickPosition / width) * duration;
    seekTo(newTime);
  };

  const startDragging = (e) => {
    if (!currentEpisode) return;
    setIsDragging(true);
    handleDrag(e);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const handleDrag = (e) => {
    if (!isDragging || !progressBarRef.current || !currentEpisode) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const dragPosition = e.clientX - rect.left;
    const width = rect.width;
    
    const newTime = Math.max(0, Math.min((dragPosition / width) * duration, duration));
    seekTo(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (volume === 0) {
      return (
        <svg className="fill-black dark:fill-[#b3b3b3]" width="24px" height="24px" viewBox="-1.5 0 19 19">
          <path d="M7.676 4.938v9.63c0 .61-.353.756-.784.325l-2.896-2.896H2.02A1.111 1.111 0 0 1 .911 10.89V8.618a1.112 1.112 0 0 1 1.108-1.109h1.977l2.896-2.896c.43-.43.784-.284.784.325zm7.251 6.888a.554.554 0 1 1-.784.784l-2.072-2.073-2.073 2.073a.554.554 0 1 1-.784-.784l2.073-2.073L9.214 7.68a.554.554 0 0 1 .784-.783L12.07 8.97l2.072-2.073a.554.554 0 0 1 .784.783l-2.072 2.073z"/>
        </svg>
      );
    } else if (volume < 50) {
      return (
        <svg className="fill-black dark:fill-[#b3b3b3]" width="24px" height="24px" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      );
    } else {
      return (
        <svg className="fill-black dark:fill-[#b3b3b3]" width="24px" height="24px" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      );
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="bottom-0 left-0 right-0 w-full fixed bg-white dark:bg-[#181818] h-25 flex-1 flex-shrink-0 flex flex-col items-center justify-between border-t border-gray-300 dark:border-[#333] p-4 text-black dark:text-[#b3b3b3] z-50">
      {/* Progress Bar - Only show when episode is playing */}
      {currentEpisode && (
        <div className="flex items-center w-full mb-4">
          <span className="w-12 text-right text-sm">{formatTime(currentTime)}</span>
          <div 
            ref={progressBarRef}
            id="progressBar" 
            className="flex-1 mx-4 h-2 bg-[#D9D9D9] rounded cursor-pointer relative progress-bar"
            onClick={handleProgressBarClick}
          >
            <div 
              className="h-full bg-[#9D610E] dark:bg-[#652A0E] rounded relative" 
              style={{ width: `${progressPercentage}%` }}
            >
              <span 
                className="absolute w-3 h-3 bg-black dark:bg-[#D9D9D9] rounded-full -right-1.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity progress-handle"
                onMouseDown={startDragging}
              />
            </div>
          </div>
          <span className="w-12 text-sm">{formatTime(duration)}</span>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex items-center justify-between md:justify-around w-full">
        {/* Episode Info - Show placeholder when no episode */}
        <div className="flex items-center justify-start w-[20%] md:w-[33%] md:mr-4">
          <img 
            src={currentEpisode?.showImage || "/src/assets/SippiCup_logo.png"} 
            alt="Album cover" 
            className="rounded-md w-[50px] h-[50px] md:mr-4 object-cover" 
          />
          <div className="hidden md:block md:flex md:flex-col md:justify-center md:items-start">
            {currentEpisode ? (
              <>
                <span className="font-medium text-black dark:text-[#fff] text-[15px] truncate max-w-[200px]">
                  {currentEpisode.title}
                </span>
                <span className="font-medium text-gray-500 dark:text-[#b3b3b3] text-[13px]">
                  {currentEpisode.showTitle}
                </span>
                <span className="font-medium text-[#b3b3b3] text-[11px]">
                  Season {currentEpisode.season} • Episode {currentEpisode.episode}
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-gray-500 dark:text-[#b3b3b3] text-[15px]">
                  No episode selected
                </span>
                <span className="font-medium text-gray-400 dark:text-[#666] text-[13px]">
                  Select an episode to play
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center w-[50%] md:w-[33%] md:space-x-2">
          <button 
            id="shuffleBtn" 
            className={`hidden md:block text-xl cursor-pointer ${isShuffleActive ? 'text-[#9D610E]' : 'text-[#b3b3b3] hover:text-white'} ${!currentEpisode ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={toggleShuffle}
            disabled={!currentEpisode}
          >
            <svg className={`${isShuffleActive ? 'fill-[#9D610E] stroke-[#9D610E]' : 'fill-black dark:fill-[#b3b3b3] stroke-black dark:stroke-[#b3b3b3]'}`} width="22px" height="22px" viewBox="0 0 24 24">
              <path d="M3,8H5.28a6,6,0,0,1,4.51,2.05L13.21,14A6,6,0,0,0,17.72,16H21" style={{fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}/>
              <polyline points="19 14 21 16 19 18" style={{fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}/>
              <path d="M21,8H17.72a6,6,0,0,0-4.51,2.05L9.79,14A6,6,0,0,1,5.28,16H3" style={{fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}/>
              <polyline points="19 6 21 8 19 10" style={{fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}/>
            </svg>
          </button>

          <button 
            id="rwBtn" 
            className={`text-2xl cursor-pointer ${currentEpisode ? 'text-[#b3b3b3] hover:text-white' : 'text-gray-400 cursor-not-allowed'}`}
            onClick={() => skipBackward(15)}
            disabled={!currentEpisode}
          >
            <svg className={`${currentEpisode ? 'fill-black dark:fill-[#b3b3b3] stroke-black dark:stroke-[#b3b3b3]' : 'fill-gray-400 stroke-gray-400'}`} width="22px" height="22px" viewBox="0 0 24 24" transform="matrix(-1, 0, 0, 1, 0, 0)">
              <path d="M21.55,11.17l-9-6a1,1,0,0,0-1,0A1,1,0,0,0,11,6v4.13l-7.45-5a1,1,0,0,0-1,0A1,1,0,0,0,2,6V18a1,1,0,0,0,.53.88,1,1,0,0,0,1-.05l7.45-5V18a1,1,0,0,0,.53.88,1,1,0,0,0,1-.05l9-6a1,1,0,0,0,0-1.66Z"/>
            </svg>
          </button>
          
          <button 
            id="playPauseBtn" 
            className={`text-3xl cursor-pointer rounded-full p-2 transition-transform ${currentEpisode ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
            onClick={togglePlayPause}
            disabled={!currentEpisode}
          >
            {isPlaying ? (
              <svg className="fill-[#b3b3b3] dark:fill-none stroke-black dark:stroke-[#b3b3b3]" width="50px" height="50px" viewBox="0 0 24 24">
                <path d="M14 9V15M10 9V15M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="fill-none dark:fill-none stroke-black dark:stroke-[#b3b3b3]" width="50px" height="50px" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"/>
              </svg>
            )}
          </button>
          
          <button 
            id="stopBtn" 
            className={`hidden md:block text-2xl cursor-pointer ${currentEpisode ? 'text-[#b3b3b3] hover:text-white' : 'text-gray-400 cursor-not-allowed'}`}
            onClick={stopPlayback}
            disabled={!currentEpisode}
          >
            <svg className={`${currentEpisode ? 'fill-black dark:fill-[#b3b3b3]' : 'fill-gray-400'}`} width="50px" height="50px" viewBox="0 0 24 24">
              <path d="M12 21C10.22 21 8.47991 20.4722 6.99987 19.4832C5.51983 18.4943 4.36628 17.0887 3.68509 15.4442C3.0039 13.7996 2.82567 11.99 3.17294 10.2442C3.5202 8.49836 4.37737 6.89472 5.63604 5.63604C6.89472 4.37737 8.49836 3.5202 10.2442 3.17294C11.99 2.82567 13.7996 3.0039 15.4442 3.68509C17.0887 4.36628 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C21 14.387 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.387 21 12 21ZM12 4.5C10.5166 4.5 9.0666 4.93987 7.83323 5.76398C6.59986 6.58809 5.63856 7.75943 5.07091 9.12988C4.50325 10.5003 4.35473 12.0083 4.64411 13.4632C4.9335 14.918 5.64781 16.2544 6.6967 17.3033C7.7456 18.3522 9.08197 19.0665 10.5368 19.3559C11.9917 19.6453 13.4997 19.4968 14.8701 18.9291C16.2406 18.3614 17.4119 17.4001 18.236 16.1668C19.0601 14.9334 19.5 13.4834 19.5 12C19.5 10.0109 18.7098 8.10323 17.3033 6.6967C15.8968 5.29018 13.9891 4.5 12 4.5Z"/>
              <path d="M14.5 8H9.5C8.67157 8 8 8.67157 8 9.5V14.5C8 15.3284 8.67157 16 9.5 16H14.5C15.3284 16 16 15.3284 16 14.5V9.5C16 8.67157 15.3284 8 14.5 8Z"/>
            </svg>
          </button>

          <button 
            id="ffBtn" 
            className={`text-2xl cursor-pointer ${currentEpisode ? 'text-[#b3b3b3] hover:text-white' : 'text-gray-400 cursor-not-allowed'}`}
            onClick={() => skipForward(15)}
            disabled={!currentEpisode}
          >
            <svg className={`${currentEpisode ? 'fill-black dark:fill-[#b3b3b3] stroke-black dark:stroke-[#b3b3b3]' : 'fill-gray-400 stroke-gray-400'}`} width="22px" height="22px" viewBox="0 0 24 24">
              <path d="M21.55,11.17l-9-6a1,1,0,0,0-1,0A1,1,0,0,0,11,6v4.13l-7.45-5a1,1,0,0,0-1,0A1,1,0,0,0,2,6V18a1,1,0,0,0,.53.88,1,1,0,0,0,1-.05l7.45-5V18a1,1,0,0,0,.53.88,1,1,0,0,0,1-.05l9-6a1,1,0,0,0,0-1.66Z"/>
            </svg>
          </button>

          <button 
            id="repeatBtn" 
            className={`hidden md:block text-xl cursor-pointer ${isRepeatActive ? 'text-[#9D610E]' : 'text-[#b3b3b3] hover:text-white'} ${!currentEpisode ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={toggleRepeat}
            disabled={!currentEpisode}
          >
            <svg className={`${isRepeatActive ? 'stroke-[#9D610E]' : 'stroke-black dark:stroke-[#b3b3b3]'}`} width="22px" height="22px" viewBox="0 0 24 24" fill="none">
              <path d="M17 2L21 6M21 6L17 10M21 6H7.8C6.11984 6 5.27976 6 4.63803 6.32698C4.07354 6.6146 3.6146 7.07354 3.32698 7.63803C3 8.27976 3 9.11984 3 10.8V11M3 18H16.2C17.8802 18 18.7202 18 19.362 17.673C19.9265 17.3854 20.3854 16.9265 20.673 16.362C21 15.7202 21 14.8802 21 13.2V13M3 18L7 22M3 18L7 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Volume Controls */}
        <div className="flex items-center justify-end w-[20%] md:w-[33%]">
          <button id="low-vol" className="hidden md:block text-xl cursor-pointer text-[#b3b3b3] hover:text-white mr-2">
            {getVolumeIcon()}
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={handleVolumeChange}
            id="volumeControl"
            className="w-24 mr-2"
          />
          <span className="hidden md:block text-sm ml-2 w-8">{volume}%</span>
        </div>
      </div>

      {/* Global event listeners for dragging */}
      {isDragging && (
        <>
          <div 
            className="fixed inset-0 z-50"
            onMouseMove={handleDrag}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          />
        </>
      )}
    </footer>
  );
};

export default GlobalAudioPlayer;