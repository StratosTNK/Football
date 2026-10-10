import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export const PLAYLIST = [
  {
    id: 'waka-waka',
    title: 'Waka Waka (This Time For Africa)',
    artist: 'Shakira',
    src: '/waka-waka.mp3',
    icon: '🌍',
    tag: 'World Cup 2010',
    duration: '03:21'
  },
  {
    id: 'la-la-la',
    title: 'La La La (Brazil 2014)',
    artist: 'Shakira',
    src: '/la-la-la.mp3',
    icon: '🇧🇷',
    tag: 'World Cup 2014',
    duration: '03:15'
  },
  {
    id: 'magic-in-the-air',
    title: 'Magic In The Air',
    artist: 'Magic System ft. Ahmed Chawki',
    src: '/magic-in-the-air.mp3',
    icon: '✨',
    tag: 'Football Anthem',
    duration: '03:53'
  },
  {
    id: 'dai-dai',
    title: 'Dai Dai',
    artist: 'Shakira & Burna Boy',
    src: '/dai-dai.mp3',
    icon: '⚽',
    tag: 'World Cup 2026',
    duration: '03:42'
  },
  {
    id: 'champions-league',
    title: 'UEFA Champions League Anthem',
    artist: 'Tony Britten',
    src: '/anthem.mp3',
    icon: '🏆',
    tag: 'Cúp C1 Châu Âu',
    duration: '00:42'
  }
];

const ChampionsLeagueAudioPlayer = forwardRef(({ showToast, onStateChange, onTrackChange, defaultTrackId = 'waka-waka' }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    try {
      const manualTrack = sessionStorage.getItem('football_user_manual_track');
      if (manualTrack === 'true') {
        const saved = localStorage.getItem('football_music_track_idx');
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < PLAYLIST.length) return parsed;
        }
      } else if (defaultTrackId) {
        const defIdx = PLAYLIST.findIndex(t => t.id === defaultTrackId);
        if (defIdx !== -1) return defIdx;
      }
    } catch {}
    return 0; // Default to Waka Waka
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem('football_music_volume');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    } catch {}
    return 0.85;
  });

  const audioRef = useRef(null);
  const userMutedRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const lastDefaultTrackRef = useRef(defaultTrackId);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;

  const currentTrack = PLAYLIST[currentTrackIndex] || PLAYLIST[0];

  // Core function to safely change and play any track in the playlist
  const changeTrack = (targetIndex, autoPlay = true, notify = true, isManual = false) => {
    const validIdx = (targetIndex + PLAYLIST.length) % PLAYLIST.length;
    currentTrackIndexRef.current = validIdx;
    setCurrentTrackIndex(validIdx);
    if (onTrackChange) onTrackChange(validIdx);

    try {
      localStorage.setItem('football_music_track_idx', String(validIdx));
      if (isManual) {
        sessionStorage.setItem('football_user_manual_track', 'true');
      }
    } catch {}

    const audio = audioRef.current;
    if (!audio) return;

    isTransitioningRef.current = true;
    userMutedRef.current = !autoPlay;

    const targetTrack = PLAYLIST[validIdx];
    audio.pause();
    audio.src = targetTrack.src;
    audio.currentTime = 0;
    audio.load();

    if (autoPlay) {
      const executePlay = () => {
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            isTransitioningRef.current = false;
            setIsPlaying(true);
            if (onStateChange) onStateChange(true);
          }).catch((err) => {
            console.warn('Playback deferred, waiting for canplay buffer:', err);
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              if (!userMutedRef.current) {
                audio.play().then(() => {
                  isTransitioningRef.current = false;
                  setIsPlaying(true);
                  if (onStateChange) onStateChange(true);
                }).catch((e) => {
                  console.error('Audio play failed after canplay:', e);
                  isTransitioningRef.current = false;
                  setIsPlaying(false);
                  if (onStateChange) onStateChange(false);
                });
              } else {
                isTransitioningRef.current = false;
              }
            };
            audio.addEventListener('canplay', onCanPlay, { once: true });
          });
        }
      };

      if (audio.readyState >= 2) {
        executePlay();
      } else {
        const onReady = () => {
          audio.removeEventListener('canplay', onReady);
          executePlay();
        };
        audio.addEventListener('canplay', onReady, { once: true });
      }
    } else {
      isTransitioningRef.current = false;
      setIsPlaying(false);
      if (onStateChange) onStateChange(false);
    }

    if (notify && showToast) {
      showToast(`🎵 Đang phát: ${targetTrack.title}`);
    }
  };

  // Sync when defaultTrackId changes (e.g. from Admin or when match data loads from server)
  useEffect(() => {
    if (!defaultTrackId) return;
    const targetIdx = PLAYLIST.findIndex(t => t.id === defaultTrackId);
    if (targetIdx === -1) return;

    let hasManual = false;
    try {
      hasManual = sessionStorage.getItem('football_user_manual_track') === 'true';
    } catch {}

    const defaultChanged = lastDefaultTrackRef.current !== defaultTrackId;
    lastDefaultTrackRef.current = defaultTrackId;

    if (defaultChanged || !hasManual) {
      if (currentTrackIndexRef.current !== targetIdx) {
        changeTrack(targetIdx, isPlaying, false, false);
      }
    }
  }, [defaultTrackId]);

  const startPlaying = () => {
    const audio = audioRef.current;
    if (audio && !userMutedRef.current) {
      if (!audio.src) {
        audio.src = PLAYLIST[currentTrackIndexRef.current].src;
        audio.load();
      }
      audio.play().then(() => {
        setIsPlaying(true);
        if (onStateChange) onStateChange(true);
      }).catch((err) => {
        console.log('Autoplay deferred for user gesture:', err);
      });
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      userMutedRef.current = true;
      audio.pause();
      setIsPlaying(false);
      if (onStateChange) onStateChange(false);
    }
  };

  const toggle = () => {
    if (isPlaying) {
      pauseAudio();
      if (showToast) showToast('🔇 Đã tắt nhạc.');
    } else {
      userMutedRef.current = false;
      const audio = audioRef.current;
      if (audio) {
        if (!audio.src) {
          audio.src = PLAYLIST[currentTrackIndexRef.current].src;
          audio.load();
        }
        audio.play().then(() => {
          setIsPlaying(true);
          if (onStateChange) onStateChange(true);
        }).catch(() => {});
      }
      if (showToast) showToast(`🎵 Đang phát: ${PLAYLIST[currentTrackIndexRef.current].title}`);
    }
  };

  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    try {
      localStorage.setItem('football_music_volume', String(clamped));
    } catch {}
  };

  const seek = (timeSec) => {
    const audio = audioRef.current;
    if (audio) {
      const dur = audio.duration;
      const maxVal = dur && !isNaN(dur) ? dur : 9999;
      const validTime = Math.max(0, Math.min(maxVal, Number(timeSec) || 0));
      try {
        audio.currentTime = validTime;
      } catch (err) {
        console.error('Seek error:', err);
      }
      setCurrentTime(validTime);
    }
  };

  useImperativeHandle(ref, () => ({
    toggle,
    play: () => {
      userMutedRef.current = false;
      const audio = audioRef.current;
      if (audio) {
        if (!audio.src) {
          audio.src = PLAYLIST[currentTrackIndexRef.current].src;
          audio.load();
        }
        audio.play().then(() => {
          setIsPlaying(true);
          if (onStateChange) onStateChange(true);
        }).catch(() => {});
      }
    },
    pause: pauseAudio,
    nextTrack: () => changeTrack(currentTrackIndexRef.current + 1, true, true, true),
    prevTrack: () => changeTrack(currentTrackIndexRef.current - 1, true, true, true),
    selectTrack: (idx, notify = true, isManual = true) => changeTrack(idx, true, notify, isManual),
    setVolume,
    seek,
    isPlaying,
    currentTrackIndex,
    currentTrack: PLAYLIST[currentTrackIndex],
    currentTime,
    duration,
    volume,
    getAudioElement: () => audioRef.current,
    audioElement: audioRef.current
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    if (!audio.src) {
      audio.src = PLAYLIST[currentTrackIndexRef.current].src;
      audio.load();
    }

    const handlePlay = () => {
      isTransitioningRef.current = false;
      setIsPlaying(true);
      if (onStateChange) onStateChange(true);
    };

    const handlePause = () => {
      if (!isTransitioningRef.current) {
        setIsPlaying(false);
        if (onStateChange) onStateChange(false);
      }
    };

    // Auto-advance to next track when current track reaches the end
    const handleEnded = () => {
      console.log('Audio track naturally ended, auto-advancing to next track...');
      isTransitioningRef.current = true;
      const nextIdx = (currentTrackIndexRef.current + 1) % PLAYLIST.length;
      changeTrack(nextIdx, true, true, false);
    };

    const handleTimeUpdate = () => {
      if (!isTransitioningRef.current && audioRef.current) {
        setCurrentTime(audioRef.current.currentTime || 0);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration || 0);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    // 1. Attempt to play on load
    startPlaying();

    // 2. Mobile & desktop autoplay policy: unlock on first gesture
    const handleFirstGesture = () => {
      if (!userMutedRef.current && audio) {
        if (!audio.src) {
          audio.src = PLAYLIST[currentTrackIndexRef.current].src;
          audio.load();
        }
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
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);

      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
      delete window.playChampionsLeagueAnthem;
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
    />
  );
});

export default ChampionsLeagueAudioPlayer;
