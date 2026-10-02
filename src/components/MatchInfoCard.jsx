import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Edit2, Navigation } from 'lucide-react';
import { formatDateDMY } from '../utils/zaloFormatter';

export default function MatchInfoCard({ match, isAdmin, onEditClick, onOpenPitchFinder }) {
  const { title, stadium, location, matchDate, matchTime, maxPlayers, players } = match;
  const currentCount = players ? players.length : 0;
  const targetMax = maxPlayers > 0 ? maxPlayers : 14;
  const progressPercent = Math.min(Math.round((currentCount / targetMax) * 100), 100);

  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!matchDate) return;
    const calculateTimeLeft = () => {
      try {
        const startTimeStr = matchTime ? matchTime.split('-')[0].trim() : '19:00';
        const targetDateTime = new Date(`${matchDate}T${startTimeStr}:00`);
        const diff = targetDateTime.getTime() - Date.now();
        if (isNaN(diff) || diff <= 0) {
          setCountdown('');
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setCountdown(`Còn ${hours}h ${minutes}p`);
      } catch {
        setCountdown('');
      }
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [matchDate, matchTime]);

  return (
    <div className="clean-card">
      {/* Title & Admin Edit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          {title || 'Kèo Bóng Đá'}
        </h2>
        {isAdmin && (
          <button 
            onClick={onEditClick}
            className="btn btn-secondary"
            style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#FFA502' }}
          >
            <Edit2 size={12} /> Sửa Kèo
          </button>
        )}
      </div>

      {/* Meta Chips */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
        <span className="info-chip">
          <Clock size={13} color="var(--emerald)" />
          <strong>{matchTime || '19:30 - 21:00'}</strong> ({formatDateDMY(matchDate) || matchDate})
        </span>

        {/* Interactive Stadium Chip */}
        <button
          type="button"
          onClick={onOpenPitchFinder}
          className="info-chip"
          style={{
            cursor: 'pointer',
            background: 'rgba(56, 189, 248, 0.12)',
            borderColor: 'rgba(56, 189, 248, 0.35)',
            color: '#38BDF8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="Bấm để xem danh sách sân bóng & số điện thoại đặt sân"
        >
          <MapPin size={13} color="#38BDF8" />
          <span>{stadium ? `${stadium}` : 'Tìm sân bóng'}</span>
        </button>

        {stadium && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Sân bóng đá ' + stadium + ' ' + (location || 'Đà Nẵng'))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="info-chip"
            style={{
              color: '#38BDF8',
              borderColor: 'rgba(56, 189, 248, 0.35)',
              background: 'rgba(56, 189, 248, 0.08)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Mở chỉ đường Google Maps"
          >
            <Navigation size={12} color="#38BDF8" />
            <span>Bản đồ</span>
          </a>
        )}

        <span className="info-chip" style={{ color: currentCount >= targetMax ? '#FF6B81' : 'var(--text-main)' }}>
          <Users size={13} color="var(--emerald)" />
          <strong>{currentCount}</strong>/{targetMax} người
        </span>

        {countdown && (
          <span className="info-chip" style={{ color: 'var(--emerald)', borderColor: 'rgba(0,242,152,0.2)' }}>
            ⏳ {countdown}
          </span>
        )}
      </div>

      {/* Thin Progress bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '10px'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: progressPercent >= 100 ? '#FF4757' : 'var(--emerald)',
          transition: 'width 0.3s ease'
        }}></div>
      </div>
    </div>
  );
}
