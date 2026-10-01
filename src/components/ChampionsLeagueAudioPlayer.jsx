import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const ChampionsLeagueAudioPlayer = forwardRef(({ showToast, onStateChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const userMutedRef = useRef(false);

  const startPlaying = () => {
    if (audioRef.current && !userMutedRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (onStateChange) onStateChange(true);
      }).catch((err) => {
        // Autoplay blocked by browser policy without user gesture yet
        console.log('Autoplay waiting for user gesture:', err);
      });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      userMutedRef.current = true;
      if (onStateChange) onStateChange(false);
    }
  };

  const toggle = () => {
    if (isPlaying) {
      pauseAudio();
      if (showToast) showToast('🔇 Đã tắt nhạc.');
    } else {
      userMutedRef.current = false;
      startPlaying();
      if (showToast) showToast('🎵 Đang phát nhạc UEFA Champions League!');
    }
  };

  useImperativeHandle(ref, () => ({
    toggle,
    play: () => {
      userMutedRef.current = false;
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        if (onStateChange) onStateChange(true);
      }
    },
    pause: pauseAudio,
    isPlaying
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.85;

    // 1. Attempt to play immediately on load
    startPlaying();

    // 2. Mobile & desktop autoplay policy: unlock on very first touch/click
    const handleFirstGesture = () => {
      if (!userMutedRef.current) {
        audio.play().then(() => {
          setIsPlaying(true);
          if (onStateChange) onStateChange(true);
        }).catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('scroll', handleFirstGesture, { passive: true });

    // 3. Expose global trigger for celebration / team split
    window.playChampionsLeagueAnthem = () => {
      userMutedRef.current = false;
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(() => {
          setIsPlaying(true);
          if (onStateChange) onStateChange(true);
        }).catch(() => {});
      }
    };

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
      delete window.playChampionsLeagueAnthem;
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/anthem.mp3"
      loop
      preload="auto"
      style={{ display: 'none' }}
    />
  );
});

export default ChampionsLeagueAudioPlayer;
