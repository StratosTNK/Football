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
      // Check if user manually picked a track in this session
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
  const lastDefaultTrackRef = useRef(defaultTrackId);

  const currentTrack = PLAYLIST[currentTrackIndex] || PLAYLIST[0];

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

    // If default track changed or user hasn't explicitly selected another song this session:
    if (defaultChanged || !hasManual) {
      if (currentTrackIndex !== targetIdx) {
        setCurrentTrackIndex(targetIdx);
        if (onTrackChange) onTrackChange(targetIdx);
        try {
          localStorage.setItem('football_music_track_idx', String(targetIdx));
        } catch {}

        const audio = audioRef.current;
        if (audio) {
          const wasPlaying = isPlaying;
          audio.src = PLAYLIST[targetIdx].src;
          audio.currentTime = 0;
          if (wasPlaying && !userMutedRef.current) {
            audio.play().catch(() => {});
          }
        }
      }
    }
  }, [defaultTrackId]);

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
      if (showToast) showToast(`🎵 Đang phát: ${currentTrack.title}`);
    }
  };

  const selectTrack = (index, notify = true, isManual = true) => {
    const validIdx = (index + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(validIdx);
    if (onTrackChange) onTrackChange(validIdx);

    try {
      localStorage.setItem('football_music_track_idx', String(validIdx));
      if (isManual) {
        sessionStorage.setItem('football_user_manual_track', 'true');
      }
    } catch {}

    const audio = audioRef.current;
    if (audio) {
      audio.src = PLAYLIST[validIdx].src;
      audio.currentTime = 0;
      userMutedRef.current = false;
      audio.play().then(() => {
        setIsPlaying(true);
        if (onStateChange) onStateChange(true);
      }).catch(() => {});
    }

    if (notify && showToast) {
      showToast(`🎵 Đang phát: ${PLAYLIST[validIdx].title}`);
    }
  };

  const nextTrack = (notify = true) => {
    selectTrack(currentTrackIndex + 1, notify, true);
  };

  const prevTrack = (notify = true) => {
    selectTrack(currentTrackIndex - 1, notify, true);
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
    if (audioRef.current) {
      audioRef.current.currentTime = timeSec;
      setCurrentTime(timeSec);
    }
  };

  useImperativeHandle(ref, () => ({
    toggle,
    play: () => {
      userMutedRef.current = false;
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        if (onStateChange) onStateChange(true);
      }
    },
    pause: pauseAudio,
    nextTrack: () => nextTrack(true),
    prevTrack: () => prevTrack(true),
    selectTrack: (idx, notify = true, isManual = true) => selectTrack(idx, notify, isManual),
    setVolume,
    seek,
    isPlaying,
    currentTrackIndex,
    currentTrack: PLAYLIST[currentTrackIndex],
    currentTime,
    duration,
    volume
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

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
      src={currentTrack.src}
      preload="auto"
      onEnded={() => nextTrack(true)}
      onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
      onLoadedMetadata={(e) => setDuration(e.target.duration)}
      style={{ display: 'none' }}
    />
  );
});

export default ChampionsLeagueAudioPlayer;
