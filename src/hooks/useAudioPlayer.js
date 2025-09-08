'use client';
import { useState, useEffect, useRef } from 'react';

export function useAudioPlayer(audioFile) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof Audio !== 'undefined' && audioFile) {
      audioRef.current = new Audio(audioFile);
      setError(null);

      const setAudioData = () => {
        setDuration(audioRef.current.duration);
      };

      const updateProgress = () => {
        setProgress(audioRef.current.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0); // Reset on end
      };

      const handleError = () => {
        setError(`Could not load audio file. Please ensure it exists at: ${audioFile}`);
      };

      audioRef.current.addEventListener('loadeddata', setAudioData);
      audioRef.current.addEventListener('timeupdate', updateProgress);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadeddata', setAudioData);
          audioRef.current.removeEventListener('timeupdate', updateProgress);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [audioFile]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };
  
  const setVolume = (volume) => {
    audioRef.current.volume = volume;
  };

  return { isPlaying, progress, duration, togglePlayPause, seek, setVolume, error };
}
