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

  // Load from localStorage on mount
  useEffect(() => {
    console.log('Loading data from localStorage...');
    
    const savedVolume = localStorage.getItem('audioVolume');
    const savedHistory = localStorage.getItem('playbackHistory');
    const savedCurrentEpisode = localStorage.getItem('currentEpisode');
    const savedRecentlyPlayed = localStorage.getItem('recentlyPlayedEpisodes');

    if (savedVolume) {
      console.log('Loaded volume:', savedVolume);
      setVolume(parseInt(savedVolume));
    }
    
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        console.log('Loaded playback history:', Object.keys(history).length, 'episodes');
        setPlaybackHistory(history);
      } catch (error) {
        console.error('Error parsing playback history:', error);
      }
    }
    
    if (savedCurrentEpisode) {
      try {
        const episode = JSON.parse(savedCurrentEpisode);
        console.log('Loaded current episode:', episode?.title);
        setCurrentEpisode(episode);
      } catch (error) {
        console.error('Error parsing current episode:', error);
      }
    }
    
    if (savedRecentlyPlayed) {
      try {
        const recently = JSON.parse(savedRecentlyPlayed);
        console.log('Loaded recently played:', recently.length, 'episodes');
        setRecentlyPlayed(recently);
      } catch (error) {
        console.error('Error parsing recently played:', error);
      }
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('audioVolume', volume.toString());
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem('playbackHistory', JSON.stringify(playbackHistory));
      console.log('Saved playback history to localStorage');
    } catch (error) {
      console.error('Error saving playback history:', error);
    }
  }, [playbackHistory]);

  useEffect(() => {
    if (currentEpisode) {
      try {
        localStorage.setItem('currentEpisode', JSON.stringify(currentEpisode));
        console.log('Saved current episode to localStorage');
      } catch (error) {
        console.error('Error saving current episode:', error);
      }
    }
  }, [currentEpisode]);

  useEffect(() => {
    try {
      localStorage.setItem('recentlyPlayedEpisodes', JSON.stringify(recentlyPlayed));
      console.log('Saved recently played to localStorage:', recentlyPlayed.length, 'episodes');
    } catch (error) {
      console.error('Error saving recently played:', error);
    }
  }, [recentlyPlayed]);

  // Add this function to track recently played episodes
  const trackRecentlyPlayed = (episodeData) => {
    console.log('Tracking recently played episode:', episodeData.title);
    
    setRecentlyPlayed(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(ep => ep.episodeId !== episodeData.episodeId);
      // Add to beginning and limit to 50 episodes (increased from 10)
      const updated = [episodeData, ...filtered].slice(0, 50);
      console.log('Updated recently played list:', updated.length, 'episodes');
      return updated;
    });
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      
      // Resume from saved position if available
      const episodeId = currentEpisode?.episodeId;
      if (episodeId && playbackHistory[episodeId]) {
        const savedTime = playbackHistory[episodeId].currentTime;
        if (savedTime > 0) {
          audio.currentTime = savedTime;
          setCurrentTime(savedTime);
          console.log('Resumed from saved position:', savedTime);
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Save progress every 5 seconds (reduced frequency)
      if (currentEpisode && Math.floor(audio.currentTime) % 5 === 0) {
        saveProgress(audio.currentTime);
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
    setPlaybackHistory(prev => ({
      ...prev,
      [episodeId]: {
        currentTime: time,
        duration: duration,
        completed: completed || (time >= duration * 0.95), // 95% to be considered completed
        lastListened: new Date().toISOString()
      }
    }));
  };

  const playEpisode = (episodeData) => {
    const { episodeId, audioUrl, title, season, episode, showTitle, showImage } = episodeData;

    console.log('Playing episode:', title);
    
    // Stop current playback
    audioRef.current.pause();
    
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

    // Load and play new audio
    audioRef.current.src = audioUrl;
    audioRef.current.load();

    const savedProgress = playbackHistory[episodeId];
    if (savedProgress && savedProgress.currentTime > 0) {
      audioRef.current.currentTime = savedProgress.currentTime;
      setCurrentTime(savedProgress.currentTime);
      console.log('Resuming from:', savedProgress.currentTime);
    } else {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
    
    setTimeout(() => {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        console.log('Playback started successfully');
      }).catch(error => {
        console.error('Playback failed:', error);
      });
    }, 100);
  };

  const clearRecentlyPlayed = () => {
    console.log('Clearing recently played list');
    setRecentlyPlayed([]);
    localStorage.removeItem('recentlyPlayedEpisodes');
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
  };

  const getEpisodeProgress = (episodeId) => {
    return playbackHistory[episodeId] || null;
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
    trackRecentlyPlayed
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};