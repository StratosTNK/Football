import React, { useState } from 'react';
import { POSITIONS, RATINGS } from '../utils/teamBalancer';
import { Sparkles, Shield, Trophy } from 'lucide-react';

export default function PlayerRegistration({ 
  status, 
  onJoin, 
  showToast 
}) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('MF'); // FW | MF | DF | GK
  const [rating, setRating] = useState('A'); // S | A | B
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên cầu thủ!');
      return;
    }

    setLoading(true);
    try {
      const res = await onJoin({
        name: name.trim(),
        position,
        rating
      });

      if (res && res.success && res.player) {
        try {
          const myIds = JSON.parse(localStorage.getItem('my_added_players') || '[]');
          myIds.push(res.player.id);
          localStorage.setItem('my_added_players', JSON.stringify(myIds));
        } catch {}

        setName('');
        const posInfo = POSITIONS[res.player.position] || POSITIONS.MF;
        const ratInfo = RATINGS[res.player.rating] || RATINGS.A;
        showToast(`⚽ Đã thêm "${res.player.name}" [${posInfo.id} - ${ratInfo.id}] vào danh sách!`);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi điểm danh!');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'LOCKED') {
    return (
      <div className="clean-card" style={{ textAlign: 'center', padding: '12px', color: '#FF6B81', fontSize: '0.85rem' }}>
        🔒 Kèo đã chốt sổ (khóa đăng ký).
      </div>
    );
  }

  return (
    <div className="clean-card" style={{ padding: '14px 16px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Name input row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            className="clean-input"
            placeholder="✍️ Nhập tên để điểm danh (thêm được nhiều người)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            required
            disabled={loading}
            style={{ flex: 1, fontSize: '0.9rem' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              padding: '10px 18px', 
              fontSize: '0.9rem',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? '...' : 'Điểm Danh ⚽'}
          </button>
        </div>

        {/* Position & Rating Selection Bars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '8px',
          padding: '10px 12px'
        }}>
          {/* Position Selector */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '6px' 
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                VỊ TRÍ SỞ TRƯỜNG:
              </span>
              <span style={{ fontSize: '0.74rem', color: POSITIONS[position]?.color, fontWeight: 700 }}>
                {POSITIONS[position]?.icon} {POSITIONS[position]?.name}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {Object.values(POSITIONS).map((pos) => {
                const isSelected = position === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPosition(pos.id)}
                    style={{
                      padding: '5px 2px',
                      borderRadius: '6px',
                      border: isSelected ? `1.5px solid ${pos.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? pos.badgeBg : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 800 : 500,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1px',
                      transition: 'all 0.15s ease'
                    }}
                    title={pos.name}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{pos.icon}</span>
                    <span style={{ color: isSelected ? pos.color : 'inherit' }}>{pos.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Tier Selector */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '6px' 
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                ĐÁNH GIÁ TRÌNH ĐỘ:
              </span>
              <span style={{ fontSize: '0.74rem', color: RATINGS[rating]?.color, fontWeight: 700 }}>
                {RATINGS[rating]?.label}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
              {Object.values(RATINGS).map((rat) => {
                const isSelected = rating === rat.id;
                return (
                  <button
                    key={rat.id}
                    type="button"
                    onClick={() => setRating(rat.id)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '6px',
                      border: isSelected ? `1.5px solid ${rat.border}` : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? rat.bg : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 800 : 500,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1px',
                      transition: 'all 0.15s ease'
                    }}
                    title={rat.desc}
                  >
                    <span style={{ fontSize: '0.85rem' }}>{rat.star}</span>
                    <span style={{ color: isSelected ? rat.color : 'inherit', fontWeight: 800 }}>
                      Hạng {rat.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
