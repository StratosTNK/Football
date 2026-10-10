import React, { useState } from 'react';
import { Shield, LogOut, Check, Music, Copy, Shuffle, MapPin, ListMusic } from 'lucide-react';
import { formatMatchForZalo } from '../utils/zaloFormatter';

export default function Header({ 
  match,
  status, 
  isAdmin, 
  musicPlaying,
  onToggleMusic,
  onOpenMusicModal,
  onNextTrack,
  currentTrack,
  onOpenLogin, 
  onLogout, 
  onOpenAdminPanel,
  onToggleSplit,
  onOpenPitchFinder,
  showToast 
}) {
  const [copiedZalo, setCopiedZalo] = useState(false);

  const handleCopyZalo = () => {
    if (match) {
      const text = formatMatchForZalo(match);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopiedZalo(true);
        showToast('📋 Đã copy nội dung gửi Zalo!');
        setTimeout(() => setCopiedZalo(false), 2000);
      }
    }
  };

  return (
    <header className="site-header">
      {/* Brand & Status Row */}
      <div className="header-brand-row">
        <div className="header-logo-group">
          <span className="header-ball-icon">⚽</span>
          <span className="header-app-title">DSU-Thanh Khê Club</span>
        </div>

        <div className="header-status-badge">
          {status === 'BALANCED' ? (
            <span className="badge badge-balanced">Đã Chia</span>
          ) : status === 'LOCKED' ? (
            <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171' }}>Đã Khóa</span>
          ) : (
            <span className="badge badge-live">
              <span className="pulse-dot"></span> Mở Điểm Danh
            </span>
          )}
        </div>
      </div>

      {/* Action buttons Row (Mobile-Optimized Flex Bar) */}
      <div className="header-actions-row">
        {isAdmin ? (
          <>
            {/* Primary Action Tier on Mobile */}
            <div className="header-primary-actions">
              <button 
                type="button"
                onClick={onToggleSplit}
                className="btn btn-header btn-header-split btn-header-music-on"
                title="Bốc thăm chia đội thi đấu"
              >
                <Shuffle size={13} />
                <span>Chia Đội</span>
              </button>

              <button 
                type="button"
                onClick={handleCopyZalo} 
                className="btn btn-zalo btn-header"
                title="Copy nhanh danh sách gửi Zalo (Quyền Admin)"
              >
                {copiedZalo ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedZalo ? 'Đã Copy' : 'Zalo'}</span>
              </button>
            </div>

            {/* Utility Toolbar Tier on Mobile */}
            <div className="header-utility-actions">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: '1.1 1 0', minWidth: 0 }}>
                <button
                  type="button"
                  onClick={onToggleMusic}
                  className={`btn btn-header ${musicPlaying ? 'btn-header-music-on' : 'btn-header-music-off'}`}
                  style={{ flex: 1, minWidth: 0, padding: '7px 4px !important', justifyContent: 'center' }}
                  title={musicPlaying ? `Đang phát: ${currentTrack?.title || 'Nhạc'} (Bấm để tắt)` : 'Bấm để bật nhạc'}
                >
                  <Music size={12} className={musicPlaying ? "spin-music" : ""} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {musicPlaying ? '♫ Bật' : '♫ Tắt'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenMusicModal) onOpenMusicModal();
                    else if (onNextTrack) onNextTrack();
                  }}
                  className="btn btn-header"
                  style={{
                    padding: '7px 5px !important',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#00F298',
                    flexShrink: 0
                  }}
                  title="Danh sách bài hát & Đổi nhạc"
                >
                  <ListMusic size={12} />
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenPitchFinder}
                className="btn btn-header btn-header-pitch"
                style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38BDF8' }}
                title="Tìm sân bóng Đà Nẵng & số điện thoại đặt sân"
              >
                <MapPin size={12} />
                <span>Sân Bóng</span>
              </button>

              <button 
                type="button"
                onClick={onOpenAdminPanel} 
                className="btn btn-header btn-header-admin"
                title="Quản trị trận đấu"
              >
                <Shield size={12} />
                <span>Admin</span>
              </button>

              <button 
                type="button"
                onClick={onLogout}
                className="btn btn-header btn-header-logout"
                title="Đăng xuất Admin"
              >
                <LogOut size={13} />
              </button>
            </div>
          </>
        ) : (
          <div className="header-guest-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: '1 1 0', minWidth: 0 }}>
              <button
                type="button"
                onClick={onToggleMusic}
                className={`btn btn-header ${musicPlaying ? 'btn-header-music-on' : 'btn-header-music-off'}`}
                style={{ flex: 1, minWidth: 0, padding: '7px 4px !important', justifyContent: 'center' }}
                title={musicPlaying ? `Đang phát: ${currentTrack?.title || 'Nhạc'} (Bấm để tắt)` : 'Bấm để bật nhạc'}
              >
                <Music size={12} className={musicPlaying ? "spin-music" : ""} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {musicPlaying ? '♫ Bật' : '♫ Tắt'}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenMusicModal) onOpenMusicModal();
                  else if (onNextTrack) onNextTrack();
                }}
                className="btn btn-header"
                style={{
                  padding: '7px 5px !important',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#00F298',
                  flexShrink: 0
                }}
                title="Danh sách bài hát & Đổi nhạc"
              >
                <ListMusic size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenPitchFinder}
              className="btn btn-header btn-header-pitch"
              style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38BDF8' }}
              title="Tìm sân bóng Đà Nẵng & số điện thoại đặt sân"
            >
              <MapPin size={12} />
              <span>Sân Bóng</span>
            </button>

            <button 
              type="button"
              onClick={onOpenLogin}
              className="btn btn-secondary btn-header"
              title="Đăng nhập Quản trị viên"
            >
              <Shield size={12} />
              <span>Admin</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
