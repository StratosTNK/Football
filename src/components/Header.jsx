import React, { useState } from 'react';
import { Shield, LogOut, Check, Music, Copy } from 'lucide-react';
import { formatMatchForZalo } from '../utils/zaloFormatter';

export default function Header({ 
  match,
  status, 
  isAdmin, 
  musicPlaying,
  onToggleMusic,
  onOpenLogin, 
  onLogout, 
  onOpenAdminPanel,
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
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0 12px 0',
      marginBottom: '8px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.4rem' }}>⚽</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              CHIA ĐỘI PHỦI
            </span>
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
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Play/Mute C1 Music button */}
        <button
          onClick={onToggleMusic}
          className="btn btn-secondary"
          style={{ 
            padding: '6px 10px', 
            fontSize: '0.8rem',
            borderColor: musicPlaying ? 'rgba(0,242,152,0.4)' : 'rgba(255,255,255,0.1)',
            color: musicPlaying ? 'var(--emerald)' : 'var(--text-muted)',
            background: musicPlaying ? 'rgba(0, 242, 152, 0.12)' : 'rgba(255, 255, 255, 0.05)'
          }}
          title={musicPlaying ? 'Bấm để tắt nhạc Cúp C1' : 'Bấm để bật lại nhạc Cúp C1'}
        >
          <Music size={14} />
          <span>{musicPlaying ? '🔊 Nhạc C1: Bật' : '🔇 Nhạc C1: Tắt'}</span>
        </button>

        {/* Copy Zalo */}
        <button 
          onClick={handleCopyZalo}
          className="btn btn-zalo"
          style={{ padding: '6px 11px', fontSize: '0.8rem' }}
          title="Copy nhanh danh sách gửi Zalo"
        >
          {copiedZalo ? <Check size={14} /> : <Copy size={14} />}
          <span>{copiedZalo ? 'Đã Copy' : 'Copy Zalo'}</span>
        </button>

        {/* Admin Login/Control */}
        {isAdmin ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={onOpenAdminPanel}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#FFA502', borderColor: 'rgba(255,165,2,0.3)' }}
            >
              <Shield size={14} /> Quản Trị
            </button>
            <button 
              onClick={onLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 8px', color: '#F87171' }}
              title="Đăng xuất Admin"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenLogin}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <Shield size={14} /> Admin
          </button>
        )}
      </div>
    </header>
  );
}
