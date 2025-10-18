import React, { createContext, useContext, useRef, useState, useEffect } from 'react'; 

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isRepeatActive, setIsRepeatActive] = useState(false);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [playbackHistory, setPlaybackHistory] = useState({});
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    console.log('Loading ALL data from localStorage...');
    
    try {
      // Load volume
      const savedVolume = localStorage.getItem('audioVolume');
      if (savedVolume) {
        console.log('Loaded volume:', savedVolume);
        setVolume(parseInt(savedVolume));
      }
      
      // Load playback history
      const savedHistory = localStorage.getItem('playbackHistory');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        console.log('Loaded playback history:', Object.keys(history).length, 'episodes');
        console.log('History details:', history);
        setPlaybackHistory(history);
      } else {
        console.log('No playback history found in localStorage');
      }
      
      // Load current episode
      const savedCurrentEpisode = localStorage.getItem('currentEpisode');
      if (savedCurrentEpisode) {
        const episode = JSON.parse(savedCurrentEpisode);
        console.log('Loaded current episode:', episode?.title);
        setCurrentEpisode(episode);
      }
      
      // Load recently played 
      const savedRecentlyPlayed = localStorage.getItem('recentlyPlayedEpisodes');
      if (savedRecentlyPlayed) {
        const recently = JSON.parse(savedRecentlyPlayed);
        console.log('Loaded recently played:', recently.length, 'episodes');
        console.log('Recently played details:', recently);
        setRecentlyPlayed(recently);
      } else {
        console.log('No recently played episodes found in localStorage');
      }
      
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setIsInitialized(true);
      console.log('AudioContext initialization complete');
    }
  }, []);

  // Save to localStorage when values change 
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('audioVolume', volume.toString());
    console.log('Saved volume:', volume);
  }, [volume, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('playbackHistory', JSON.stringify(playbackHistory));
      console.log('Saved playback history:', Object.keys(playbackHistory).length, 'episodes');
    } catch (error) {
      console.error('Error saving playback history:', error);
    }
  }, [playbackHistory, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (currentEpisode) {
      try {
        localStorage.setItem('currentEpisode', JSON.stringify(currentEpisode));
        console.log('Saved current episode:', currentEpisode.title);
      } catch (error) {
        console.error('Error saving current episode:', error);
      }
    }
  }, [currentEpisode, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('recentlyPlayedEpisodes', JSON.stringify(recentlyPlayed));
      console.log('Saved recently played:', recentlyPlayed.length, 'episodes');
    } catch (error) {
      console.error('Error saving recently played:', error);
    }
  }, [recentlyPlayed, isInitialized]);

  // Function to track recently played episodes
  const trackRecentlyPlayed = (episodeData) => {
    console.log('Tracking recently played episode:', episodeData.title);
    
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(ep => ep.episodeId !== episodeData.episodeId);
      const updated = [episodeData, ...filtered].slice(0, 50);
      console.log('Updated recently played list:', updated.length, 'episodes');
      return updated;
    });
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      setDuration(audioDuration);
      console.log('Audio duration loaded:', audioDuration);
      
      // Resume from saved position if available
      const episodeId = currentEpisode?.episodeId;
      if (episodeId && playbackHistory[episodeId]) {
        const savedProgress = playbackHistory[episodeId];
        const savedTime = savedProgress.currentTime;
        
        // Only resume if we have a valid time and it's not completed
        if (savedTime > 0 && !savedProgress.completed && savedTime < audioDuration) {
          // Small delay to ensure audio is fully loaded
          setTimeout(() => {
            audio.currentTime = savedTime;
            setCurrentTime(savedTime);
            console.log('Resumed from saved position:', savedTime, '/', audioDuration);
          }, 100);
        }
      }
    };

    const handleTimeUpdate = () => {
      const currentAudioTime = audio.currentTime;
      setCurrentTime(currentAudioTime);
      
      // Save progress every second (more frequent)
      if (currentEpisode && Math.floor(currentAudioTime) % 1 === 0) {
        saveProgress(currentAudioTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      
      if (currentEpisode) {
        // Mark as completed
        saveProgress(duration, true);
        console.log('Episode completed:', currentEpisode.title);
        
        if (isRepeatActive) {
          // Restart the same episode
          setTimeout(() => playEpisode(currentEpisode), 500);
        }
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentEpisode, playbackHistory, isRepeatActive]);

  // Volume control
  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  const saveProgress = (time, completed = false) => {
    if (!currentEpisode) return;

    const episodeId = currentEpisode.episodeId;
    
    // completion threshold (90%)
    const isCompleted = completed || (duration > 0 && time >= duration * 0.90);
    
    console.log('Saving progress for', currentEpisode.title, ':', time, '/', duration, 'completed:', isCompleted);
    
    setPlaybackHistory(prev => ({
      ...prev,
      [episodeId]: {
        currentTime: time,
        duration: duration,
        completed: isCompleted,
        lastListened: new Date().toISOString()
      }
    }));
  };

  const playEpisode = (episodeData) => {
    const { episodeId, audioUrl, title, season, episode, showTitle, showImage } = episodeData;

    console.log('Playing episode:', title);

    if (currentEpisode?.episodeId === episodeId) {
      console.log('Toggling play/pause for current episode');
      return togglePlayPause();
    }

    // Stop current playback if playing
    if (isPlaying && currentEpisode) {
      audioRef.current.pause();
    }
    
    // Set new episode
    const newEpisode = {
      episodeId,
      audioUrl,
      title,
      season,
      episode,
      showTitle,
      showImage
    };

    setCurrentEpisode(newEpisode);

    // Track in recently played
    trackRecentlyPlayed(newEpisode);

    // Get saved progress before loading audio
    const savedProgress = playbackHistory[episodeId];
    const resumeTime = savedProgress && !savedProgress.completed ? savedProgress.currentTime : 0;

    console.log('Resume time for', title, ':', resumeTime);

    // Load new audio
    audioRef.current.src = audioUrl;
    audioRef.current.load();
    
    // Set the time immediately after load
    audioRef.current.currentTime = resumeTime;
    setCurrentTime(resumeTime);

    // Play after a small delay
    setTimeout(() => {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        console.log('▶️ Playback started successfully from:', resumeTime);
      }).catch(error => {
        console.error('Playback failed:', error);
      });
    }, 200);
  };

  const clearRecentlyPlayed = () => {
    console.log('Clearing recently played list');
    setRecentlyPlayed([]);
    localStorage.removeItem('recentlyPlayedEpisodes');
  };

  const debugEpisodeProgress = (episodeId) => {
    const progress = playbackHistory[episodeId];
    console.log('Progress for', episodeId, ':', progress);
    return progress;
  };

  const togglePlayPause = () => {
    if (!currentEpisode) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      // Save progress when pausing
      saveProgress(audioRef.current.currentTime);
      console.log('Playback paused');
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        console.log('Playback resumed');
      }).catch(error => {
        console.error('Playback failed:', error);
      });
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      saveProgress(time);
    }
  };

  const skipForward = (seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + seconds, duration);
      seekTo(newTime);
    }
  };

  const skipBackward = (seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      seekTo(newTime);
    }
  };

  const toggleRepeat = () => {
    setIsRepeatActive(!isRepeatActive);
  };

  const toggleShuffle = () => {
    setIsShuffleActive(!isShuffleActive);
  };

  const stopPlayback = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const resetHistory = () => {
    setPlaybackHistory({});
    setRecentlyPlayed([]);
    localStorage.removeItem('playbackHistory');
    localStorage.removeItem('recentlyPlayedEpisodes');
    console.log('Reset all history');
  };

  const getEpisodeProgress = (episodeId) => {
    return playbackHistory[episodeId] || null;
  };

  // Function to directly read from localStorage (for components that need immediate access)
  const getProgressFromStorage = (episodeId) => {
    try {
      const savedHistory = localStorage.getItem('playbackHistory');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        return history[episodeId] || null;
      }
    } catch (error) {
      console.error('Error getting progress from storage:', error);
    }
    return null;
  };

  const value = {
    // State
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeatActive,
    isShuffleActive,
    playbackHistory,
    recentlyPlayed,
    isInitialized,
    
    // Actions
    playEpisode,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    stopPlayback,
    resetHistory,
    getEpisodeProgress,
    clearRecentlyPlayed,
    debugEpisodeProgress,
    trackRecentlyPlayed,
    getProgressFromStorage
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};