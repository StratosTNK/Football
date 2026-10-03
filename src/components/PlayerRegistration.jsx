import React, { useState } from 'react';
import { POSITIONS, RATINGS } from '../utils/teamBalancer';
import { 
  UserPlus, 
  X, 
  Check, 
  AlertCircle, 
  User, 
  Crosshair, 
  Activity, 
  Shield, 
  Hand, 
  Crown, 
  Zap, 
  Lock, 
  MessageSquare,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function PlayerRegistration({ 
  status, 
  onJoin, 
  showToast 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('MF'); // FW | MF | DF | GK
  const [rating, setRating] = useState('A'); // S | A | B
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setShowError(true);
      showToast?.('⚠️ Vui lòng nhập họ tên cầu thủ trước khi tham gia!');
      return;
    }

    setLoading(true);
    setShowError(false);
    try {
      const res = await onJoin({
        name: name.trim(),
        position,
        rating,
        note: note.trim()
      });

      if (res && res.success && res.player) {
        try {
          const myIds = JSON.parse(localStorage.getItem('my_added_players') || '[]');
          myIds.push(res.player.id);
          localStorage.setItem('my_added_players', JSON.stringify(myIds));
        } catch {}

        setName('');
        setNote('');
        setIsOpen(false);

        const posInfo = POSITIONS[res.player.position] || POSITIONS.MF;
        const ratInfo = RATINGS[res.player.rating] || RATINGS.A;
        showToast?.(`⚽ Đã thêm "${res.player.name}" [${posInfo.id} - ${ratInfo.id}] vào trận đấu!`);
      }
    } catch (err) {
      showToast?.(err.message || 'Lỗi khi điểm danh!');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = status === 'LOCKED';
  const hasName = Boolean(name.trim());

  // Role visual configuration
  const ROLE_CONFIGS = {
    FW: {
      id: 'FW',
      label: 'Tiền đạo',
      desc: 'Dứt điểm, tấn công',
      color: '#FF4757',
      gradient: 'linear-gradient(145deg, rgba(255, 71, 87, 0.22) 0%, rgba(220, 38, 38, 0.06) 100%)',
      borderActive: '#FF4757',
      glow: 'rgba(255, 71, 87, 0.3)',
      icon: <Crosshair size={20} strokeWidth={2.3} />
    },
    MF: {
      id: 'MF',
      label: 'Tiền vệ',
      desc: 'Kiến thiết, điều tiết',
      color: '#00F298',
      gradient: 'linear-gradient(145deg, rgba(0, 242, 152, 0.22) 0%, rgba(5, 150, 105, 0.06) 100%)',
      borderActive: '#00F298',
      glow: 'rgba(0, 242, 152, 0.3)',
      icon: <Activity size={20} strokeWidth={2.3} />
    },
    DF: {
      id: 'DF',
      label: 'Hậu vệ',
      desc: 'Đánh chặn, phòng thủ',
      color: '#38BDF8',
      gradient: 'linear-gradient(145deg, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0.06) 100%)',
      borderActive: '#38BDF8',
      glow: 'rgba(56, 189, 248, 0.3)',
      icon: <Shield size={20} strokeWidth={2.3} />
    },
    GK: {
      id: 'GK',
      label: 'Thủ môn',
      desc: 'Gác đền, phản xạ',
      color: '#F59E0B',
      gradient: 'linear-gradient(145deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.06) 100%)',
      borderActive: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.3)',
      icon: <Hand size={20} strokeWidth={2.3} />
    }
  };

  // Tier visual configuration
  const TIER_CONFIGS = {
    S: {
      id: 'S',
      title: 'Hạng S',
      badgeText: 'TOP TIER',
      desc: 'Đá hay • Công thủ toàn diện',
      color: '#FFD700',
      gradient: 'linear-gradient(145deg, rgba(255, 215, 0, 0.18) 0%, rgba(200, 140, 10, 0.05) 100%)',
      borderActive: '#FFD700',
      glow: 'rgba(255, 215, 0, 0.25)',
      icon: <Crown size={19} color="#FFD700" strokeWidth={2.2} />
    },
    A: {
      id: 'A',
      title: 'Hạng A',
      badgeText: 'CORE TIER',
      desc: 'Biết đá • Mạnh 1 sở trường',
      color: '#A78BFA',
      gradient: 'linear-gradient(145deg, rgba(167, 139, 250, 0.18) 0%, rgba(124, 58, 237, 0.05) 100%)',
      borderActive: '#A78BFA',
      glow: 'rgba(167, 139, 250, 0.25)',
      icon: <Zap size={19} color="#A78BFA" strokeWidth={2.2} />
    },
    B: {
      id: 'B',
      title: 'Hạng B',
      badgeText: 'CLUB TIER',
      desc: 'Biết đá • Đang rèn luyện',
      color: '#2DD4BF',
      gradient: 'linear-gradient(145deg, rgba(45, 212, 191, 0.16) 0%, rgba(13, 148, 136, 0.05) 100%)',
      borderActive: '#2DD4BF',
      glow: 'rgba(45, 212, 191, 0.25)',
      icon: <Shield size={19} color="#2DD4BF" strokeWidth={2.2} />
    }
  };

  const currentRole = ROLE_CONFIGS[position] || ROLE_CONFIGS.MF;
  const currentTier = TIER_CONFIGS[rating] || TIER_CONFIGS.A;

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Primary Trigger Button: THAM GIA (Fully Mobile-Optimized) */}
      <button
        type="button"
        id="btn-open-join-modal"
        onClick={() => !isLocked && setIsOpen(true)}
        disabled={isLocked}
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          padding: '12px 14px',
          borderRadius: '16px',
          background: isLocked 
            ? 'rgba(255, 255, 255, 0.04)' 
            : 'linear-gradient(135deg, #00F298 0%, #00B96B 100%)',
          color: isLocked ? '#FF6B81' : '#04160E',
          border: isLocked 
            ? '1px dashed rgba(255, 107, 129, 0.35)' 
            : '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: isLocked 
            ? 'none' 
            : '0 8px 24px -4px rgba(0, 242, 152, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          whiteSpace: 'normal',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <div style={{
            width: '38px',
            height: '38px',
            minWidth: '38px',
            flexShrink: 0,
            borderRadius: '11px',
            background: isLocked ? 'rgba(255, 71, 87, 0.12)' : 'rgba(0, 0, 0, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: isLocked ? 'none' : 'inset 0 1px 1px rgba(255,255,255,0.2)'
          }}>
            {isLocked ? '🔒' : '⚽'}
          </div>

          <div style={{ textAlign: 'left', minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 800, 
              letterSpacing: '0.02em', 
              textTransform: 'uppercase',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {isLocked ? 'KÈO ĐÃ KHÓA' : 'THAM GIA'}
            </div>
            <div style={{ 
              fontSize: '0.72rem', 
              opacity: isLocked ? 0.75 : 0.88, 
              fontWeight: 500, 
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {isLocked ? 'Đã chốt danh sách thi đấu' : 'Chọn vị trí & trình độ thi đấu'}
            </div>
          </div>
        </div>

        {!isLocked && (
          <div style={{
            flexShrink: 0,
            background: 'rgba(0, 0, 0, 0.22)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.18)',
            whiteSpace: 'nowrap'
          }}>
            <UserPlus size={14} />
            <span>Đăng Ký</span>
          </div>
        )}
      </button>

      {/* Registration Modal Popup */}
      {isOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => !loading && setIsOpen(false)}
          style={{ 
            animation: 'fadeIn 0.2s ease',
            background: 'rgba(3, 7, 13, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 999
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '460px', 
              width: '100%',
              boxSizing: 'border-box',
              padding: '18px 16px',
              animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              background: 'linear-gradient(175deg, #111B2B 0%, #0A101A 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderTop: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 242, 152, 0.08)',
              overflowX: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '18px', 
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 242, 152, 0.2) 0%, rgba(0, 185, 107, 0.08) 100%)',
                  border: '1px solid rgba(0, 242, 152, 0.35)',
                  color: '#00F298',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 242, 152, 0.18)'
                }}>
                  <Sparkles size={19} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
                    Điểm Danh Tham Gia Kèo
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                    Chọn vị trí & trình độ để thuật toán xếp đội công bằng
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !loading && setIsOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
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
                <X size={16} />
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Field 1: Name (Required) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 700, margin: 0 }}>
                    Họ và tên cầu thủ: <span style={{ color: '#FF4757' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Bắt buộc
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: showError ? '#FF4757' : (hasName ? '#00F298' : '#64748B'),
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    transition: 'color 0.2s ease'
                  }}>
                    <User size={17} />
                  </div>

                  <input 
                    type="text"
                    placeholder="VD: Nguyễn Văn Khoa, Tuấn Đỗ..."
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (showError && e.target.value.trim()) setShowError(false);
                    }}
                    maxLength={40}
                    required
                    autoFocus
                    disabled={loading}
                    style={{ 
                      width: '100%',
                      background: 'rgba(13, 21, 33, 0.85)',
                      border: showError 
                        ? '1.5px solid #FF4757' 
                        : (hasName ? '1px solid rgba(0, 242, 152, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)'),
                      borderRadius: '12px',
                      padding: '12px 14px 12px 40px',
                      color: '#FFFFFF',
                      fontSize: '0.94rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxShadow: showError 
                        ? '0 0 0 3px rgba(255, 71, 87, 0.15)' 
                        : (hasName ? '0 0 0 3px rgba(0, 242, 152, 0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.3)'),
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>

                {showError && (
                  <div style={{ 
                    fontSize: '0.74rem', 
                    color: '#FF6B81', 
                    marginTop: '6px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    background: 'rgba(255, 71, 87, 0.08)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 71, 87, 0.2)'
                  }}>
                    <AlertCircle size={13} />
                    <span>Bạn bắt buộc phải nhập họ tên để xác nhận tham gia!</span>
                  </div>
                )}
              </div>

              {/* Field 2: Position Selector */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 700, margin: 0 }}>
                    Vị trí sở trường: <span style={{ color: '#FF4757' }}>*</span>
                  </label>
                  <span style={{ 
                    fontSize: '0.74rem', 
                    color: currentRole.color, 
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${currentRole.color}40`
                  }}>
                    {currentRole.id} • {currentRole.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {Object.values(ROLE_CONFIGS).map((pos) => {
                    const isSelected = position === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPosition(pos.id)}
                        style={{
                          padding: '9px 2px',
                          minWidth: 0,
                          boxSizing: 'border-box',
                          borderRadius: '12px',
                          border: isSelected 
                            ? `1.5px solid ${pos.borderActive}` 
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected 
                            ? pos.gradient 
                            : 'rgba(255, 255, 255, 0.025)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: isSelected 
                            ? `0 6px 18px ${pos.glow}, inset 0 1px 0 rgba(255,255,255,0.2)` 
                            : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <div style={{ 
                          color: isSelected ? pos.color : '#94A3B8',
                          transition: 'color 0.15s ease' 
                        }}>
                          {pos.icon}
                        </div>
                        <span style={{ 
                          fontSize: '0.84rem', 
                          fontWeight: 800, 
                          color: isSelected ? pos.color : '#FFFFFF',
                          letterSpacing: '0.01em',
                          whiteSpace: 'nowrap'
                        }}>
                          {pos.id}
                        </span>
                        <span style={{ 
                          fontSize: '0.64rem', 
                          color: isSelected ? '#E2E8F0' : '#64748B',
                          fontWeight: isSelected ? 600 : 500,
                          whiteSpace: 'nowrap'
                        }}>
                          {pos.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Rating Tier Selector */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 700, margin: 0 }}>
                    Mức đánh giá khả năng: <span style={{ color: '#FF4757' }}>*</span>
                  </label>
                  <span style={{ 
                    fontSize: '0.74rem', 
                    color: currentTier.color, 
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${currentTier.color}40`
                  }}>
                    {currentTier.desc}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {Object.values(TIER_CONFIGS).map((rat) => {
                    const isSelected = rating === rat.id;
                    return (
                      <button
                        key={rat.id}
                        type="button"
                        onClick={() => setRating(rat.id)}
                        style={{
                          padding: '10px 4px 8px 4px',
                          minWidth: 0,
                          boxSizing: 'border-box',
                          borderRadius: '14px',
                          border: isSelected 
                            ? `1.5px solid ${rat.borderActive}` 
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected 
                            ? rat.gradient 
                            : 'rgba(255, 255, 255, 0.025)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '3px',
                          textAlign: 'center',
                          boxShadow: isSelected 
                            ? `0 8px 24px ${rat.glow}, inset 0 1px 0 rgba(255,255,255,0.25)` 
                            : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <div style={{ marginBottom: '2px' }}>
                          {rat.icon}
                        </div>
                        <span style={{ 
                          fontSize: '0.86rem', 
                          fontWeight: 800, 
                          color: isSelected ? rat.color : '#FFFFFF',
                          letterSpacing: '0.01em',
                          whiteSpace: 'nowrap'
                        }}>
                          {rat.title}
                        </span>
                        <span style={{ 
                          fontSize: '0.64rem', 
                          color: isSelected ? '#F1F5F9' : '#64748B', 
                          lineHeight: 1.25,
                          fontWeight: isSelected ? 600 : 400
                        }}>
                          {rat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 4: Note (Optional) */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Ghi chú thêm (không bắt buộc):
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <MessageSquare size={15} />
                  </div>
                  <input 
                    type="text"
                    placeholder="VD: Đến trễ 10p, mang theo áo phụ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={60}
                    disabled={loading}
                    style={{ 
                      width: '100%',
                      background: 'rgba(13, 21, 33, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '9px 12px 9px 36px',
                      color: '#E2E8F0',
                      fontSize: '0.84rem',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  style={{ 
                    flex: 1, 
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X size={15} />
                  <span>Đóng</span>
                </button>

                <button
                  type="submit"
                  id="btn-confirm-join"
                  disabled={loading || !hasName}
                  style={{ 
                    flex: 2, 
                    padding: '12px', 
                    borderRadius: '12px',
                    fontSize: '0.94rem', 
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    ...(hasName ? {
                      background: 'linear-gradient(135deg, #00F298 0%, #00B96B 100%)',
                      color: '#03140C',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 6px 20px rgba(0, 242, 152, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer'
                    } : {
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#64748B',
                      border: '1px dashed rgba(255, 255, 255, 0.12)',
                      boxShadow: 'none',
                      cursor: 'not-allowed'
                    })
                  }}
                >
                  {loading ? (
                    <span>Đang gửi...</span>
                  ) : hasName ? (
                    <>
                      <UserCheck size={17} />
                      <span>Xác Nhận Tham Gia ⚽</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Nhập tên để tham gia</span>
                    </>
                  )}
                </button>
              </div>

              {!hasName && (
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '0.72rem', 
                  color: '#64748B',
                  marginTop: '-6px'
                }}>
                  * Vui lòng điền họ tên bên trên để mở khóa nút xác nhận
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

