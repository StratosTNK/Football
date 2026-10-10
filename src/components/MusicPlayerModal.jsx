import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  X, 
  Music, 
  Disc3, 
  CheckCircle2,
  Crown,
  Star
} from 'lucide-react';
import Portal from './Portal';
import { PLAYLIST } from './ChampionsLeagueAudioPlayer';

export default function MusicPlayerModal({
  isOpen,
  onClose,
  currentTrackIndex = 0,
  isPlaying = false,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSelectTrack,
  audioRef,
  onSeek,
  volume = 0.85,
  onVolumeChange,
  isAdmin = false,
  defaultTrackId = 'waka-waka',
  onSetDefaultTrack
}) {
  if (!isOpen) return null;

  const currentTrack = PLAYLIST[currentTrackIndex] || PLAYLIST[0];

  // Helper to parse preconfigured "mm:ss" duration from PLAYLIST
  const parseDurationString = (str) => {
    if (!str) return 0;
    const parts = str.split(':').map(Number);
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
    return Number(str) || 0;
  };

  const fallbackDuration = parseDurationString(currentTrack.duration);

  // Local real-time audio progress synchronized directly with native audio events
  const [internalTime, setInternalTime] = useState(0);
  const [internalDuration, setInternalDuration] = useState(fallbackDuration || 0);

  // Scrubbing (dragging) state for silky-smooth response
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const isScrubbingRef = useRef(false);
  const scrubTimeRef = useRef(0);

  // Update duration when track changes
  useEffect(() => {
    const fDur = parseDurationString(currentTrack.duration);
    setInternalDuration(fDur || 0);

    const audio = audioRef?.current?.getAudioElement?.() || audioRef?.current?.audioElement;
    if (audio) {
      setInternalTime(audio.currentTime || 0);
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setInternalDuration(audio.duration);
      }
    } else {
      setInternalTime(0);
    }
  }, [currentTrackIndex, currentTrack.duration, audioRef]);

  // Synchronize directly with HTML5 Audio element events with zero lag
  useEffect(() => {
    if (!isOpen) return;

    const audio = audioRef?.current?.getAudioElement?.() || audioRef?.current?.audioElement;
    if (!audio) return;

    const syncAudio = () => {
      if (!isScrubbingRef.current) {
        setInternalTime(audio.currentTime || 0);
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          setInternalDuration(audio.duration);
        }
      }
    };

    audio.addEventListener('timeupdate', syncAudio);
    audio.addEventListener('loadedmetadata', syncAudio);
    audio.addEventListener('durationchange', syncAudio);
    audio.addEventListener('play', syncAudio);
    audio.addEventListener('pause', syncAudio);
    audio.addEventListener('seeked', syncAudio);
    audio.addEventListener('ended', syncAudio);

    // Initial read
    syncAudio();

    return () => {
      audio.removeEventListener('timeupdate', syncAudio);
      audio.removeEventListener('loadedmetadata', syncAudio);
      audio.removeEventListener('durationchange', syncAudio);
      audio.removeEventListener('play', syncAudio);
      audio.removeEventListener('pause', syncAudio);
      audio.removeEventListener('seeked', syncAudio);
      audio.removeEventListener('ended', syncAudio);
    };
  }, [isOpen, audioRef, currentTrackIndex]);

  // Global mouseup/touchend release to ensure smooth drag completion anywhere on screen
  useEffect(() => {
    if (!isScrubbing) return;

    const handleGlobalRelease = () => {
      if (isScrubbingRef.current) {
        isScrubbingRef.current = false;
        setIsScrubbing(false);
        const finalTime = scrubTimeRef.current;
        if (onSeek) onSeek(finalTime);
      }
    };

    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);

    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
    };
  }, [isScrubbing, onSeek]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const effectiveDuration = internalDuration > 0 ? internalDuration : (fallbackDuration || 100);
  const displayCurrentTime = isScrubbing ? scrubTime : internalTime;
  const progressPercent = effectiveDuration > 0 
    ? Math.max(0, Math.min(100, (displayCurrentTime / effectiveDuration) * 100))
    : 0;

  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '420px',
            width: '100%',
            maxHeight: 'calc(100dvh - 30px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '18px 16px',
            background: 'linear-gradient(175deg, #0E1624 0%, #070B13 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: '1px solid rgba(0, 242, 152, 0.35)',
            borderRadius: '22px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 242, 152, 0.08)',
            margin: 'auto',
            animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 242, 152, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid rgba(0, 242, 152, 0.35)',
                color: '#00F298',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 4px 14px rgba(0, 242, 152, 0.18)'
              }}>
                <Music size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Âm Nhạc Sân Cỏ
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                  Playlist nhạc bóng đá cổ động sôi động
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Now Playing Visual Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Spinning Disc Effect */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #1F2937 25%, #0B0F19 65%, #000000 100%)',
              border: '3px solid rgba(255, 255, 255, 0.15)',
              boxShadow: isPlaying ? '0 0 25px rgba(0, 242, 152, 0.35)' : '0 4px 15px rgba(0, 0, 0, 0.5)',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              animation: isPlaying ? 'spinDisc 6s linear infinite' : 'none'
            }}>
              <span style={{ fontSize: '1.8rem', zIndex: 2 }}>{currentTrack.icon}</span>
              <div style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#070B13',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }} />
            </div>

            {/* Track Info */}
            <h4 style={{
              fontSize: '0.96rem',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              lineHeight: 1.3
            }}>
              {currentTrack.title}
            </h4>

            <div style={{
              fontSize: '0.76rem',
              color: '#00F298',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>{currentTrack.artist}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{
                background: 'rgba(0, 242, 152, 0.12)',
                border: '1px solid rgba(0, 242, 152, 0.25)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                color: '#00F298'
              }}>
                {currentTrack.tag}
              </span>
            </div>

            {/* Scrubber Progress Bar */}
            <div style={{ marginTop: '14px', marginBottom: '6px' }}>
              <input 
                type="range"
                className="music-scrubber"
                min="0"
                max={effectiveDuration || 100}
                step="0.1"
                value={displayCurrentTime || 0}
                onMouseDown={(e) => {
                  isScrubbingRef.current = true;
                  setIsScrubbing(true);
                  const val = parseFloat(e.target.value);
                  setScrubTime(val);
                  scrubTimeRef.current = val;
                }}
                onTouchStart={(e) => {
                  isScrubbingRef.current = true;
                  setIsScrubbing(true);
                  const val = parseFloat(e.target.value);
                  setScrubTime(val);
                  scrubTimeRef.current = val;
                }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setScrubTime(val);
                  scrubTimeRef.current = val;
                  if (!isScrubbingRef.current) {
                    if (onSeek) onSeek(val);
                  }
                }}
                onMouseUp={(e) => {
                  if (isScrubbingRef.current) {
                    isScrubbingRef.current = false;
                    setIsScrubbing(false);
                    const val = parseFloat(e.target.value);
                    if (onSeek) onSeek(val);
                  }
                }}
                onTouchEnd={() => {
                  if (isScrubbingRef.current) {
                    isScrubbingRef.current = false;
                    setIsScrubbing(false);
                    if (onSeek) onSeek(scrubTimeRef.current);
                  }
                }}
                style={{
                  background: `linear-gradient(to right, #00F298 0%, #00F298 ${progressPercent}%, rgba(255, 255, 255, 0.16) ${progressPercent}%, rgba(255, 255, 255, 0.16) 100%)`
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                fontVariantNumeric: 'tabular-nums',
                color: '#94A3B8',
                marginTop: '6px',
                fontWeight: 600
              }}>
                <span style={{ 
                  color: isScrubbing ? '#00F298' : '#CBD5E1', 
                  fontWeight: isScrubbing ? 800 : 600,
                  transition: 'color 0.15s ease' 
                }}>
                  {formatTime(displayCurrentTime)}
                </span>
                <span>{formatTime(effectiveDuration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '10px'
            }}>
              <button
                type="button"
                onClick={onPrevTrack}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="Bài trước"
              >
                <SkipBack size={16} />
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00F298 0%, #00B96B 100%)',
                  border: 'none',
                  color: '#070C15',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(0, 242, 152, 0.4)',
                  transition: 'transform 0.15s ease'
                }}
                title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
              >
                {isPlaying ? <Pause size={22} fill="#070C15" /> : <Play size={22} fill="#070C15" style={{ marginLeft: '2px' }} />}
              </button>

              <button
                type="button"
                onClick={onNextTrack}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="Bài tiếp theo"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>

          {/* Playlist Selection List */}
          <div style={{ marginBottom: '16px' }}>
            {/* Admin Guidance Banner */}
            {isAdmin && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(16, 185, 129, 0.08) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '9px 12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.22)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FCD34D',
                  flexShrink: 0
                }}>
                  <Crown size={15} />
                </div>
                <div style={{ fontSize: '0.73rem', color: '#E2E8F0', lineHeight: 1.4 }}>
                  <strong style={{ color: '#FDE68A' }}>Quyền Quản Trị:</strong> Bấm <strong style={{ color: '#FCD34D' }}>"Đặt phát trước"</strong> ở bài hát bạn muốn để bất kỳ ai vào web hoặc khi làm mới trận đều nghe bài đó đầu tiên.
                </div>
              </div>
            )}

            <div style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>DANH SÁCH BÀI HÁT ({PLAYLIST.length})</span>
              <span style={{ fontSize: '0.7rem', color: '#00F298' }}>Tự động chuyển bài khi hết</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PLAYLIST.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                const isDefault = (defaultTrackId || 'waka-waka') === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => onSelectTrack(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: isSelected 
                        ? 'rgba(0, 242, 152, 0.12)' 
                        : isDefault
                          ? 'rgba(245, 158, 11, 0.05)'
                          : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected 
                        ? '1px solid rgba(0, 242, 152, 0.4)' 
                        : isDefault
                          ? '1px solid rgba(245, 158, 11, 0.35)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected 
                          ? 'rgba(0, 242, 152, 0.2)' 
                          : isDefault
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected 
                          ? '1px solid rgba(0, 242, 152, 0.4)' 
                          : isDefault
                            ? '1px solid rgba(245, 158, 11, 0.35)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        flexShrink: 0
                      }}>
                        {track.icon}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          color: isSelected ? '#00F298' : '#FFFFFF',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {track.title}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#94A3B8',
                          marginTop: '2px'
                        }}>
                          {track.artist} • <span style={{ color: 'var(--emerald)', opacity: 0.85 }}>{track.tag}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      flexShrink: 0, 
                      marginLeft: '8px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end', 
                      gap: '4px' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSelected ? (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: 'var(--emerald)',
                            background: 'rgba(0, 242, 152, 0.15)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 242, 152, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            {isPlaying ? '▶ Đang phát' : '⏸ Đang chọn'}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-dim)',
                            fontWeight: 600
                          }}>
                            {track.duration}
                          </span>
                        )}
                      </div>

                      {/* Default Track Indicator or Admin Designation Button */}
                      {isDefault ? (
                        <span style={{
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          color: '#FCD34D',
                          background: 'rgba(245, 158, 11, 0.18)',
                          border: '1px solid rgba(245, 158, 11, 0.45)',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap'
                        }}>
                          <Crown size={10} color="#FCD34D" />
                          <span>Phát đầu tiên</span>
                        </span>
                      ) : isAdmin ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSetDefaultTrack) {
                              onSetDefaultTrack(track.id);
                            }
                          }}
                          style={{
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            color: '#FDE68A',
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                          title="Chỉ định bài này làm bài phát đầu tiên cho tất cả thành viên khi vào web / reset"
                        >
                          <Star size={10} fill="#F59E0B" color="#F59E0B" />
                          <span>Đặt phát trước</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              onClick={() => onVolumeChange && onVolumeChange(volume > 0 ? 0 : 0.85)}
              style={{
                background: 'none',
                border: 'none',
                color: volume > 0 ? '#00F298' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={volume > 0 ? 'Tắt âm lượng' : 'Bật âm lượng'}
            >
              {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange && onVolumeChange(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--emerald)',
                cursor: 'pointer',
                height: '4px'
              }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.86rem'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </Portal>
  );
}
