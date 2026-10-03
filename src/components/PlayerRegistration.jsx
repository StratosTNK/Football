import React, { useState } from 'react';
import { POSITIONS, RATINGS, derivePlayerAttributes } from '../utils/teamBalancer';
import { 
  UserPlus, 
  X, 
  AlertCircle, 
  User, 
  Crosshair, 
  Activity, 
  Shield, 
  Hand, 
  Sparkles,
  UserCheck,
  Lock
} from 'lucide-react';

export default function PlayerRegistration({ 
  status, 
  onJoin, 
  showToast 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [skills, setSkills] = useState({
    FW: 'B',
    MF: 'B',
    DF: 'B',
    GK: 'B'
  });
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
      const derived = derivePlayerAttributes(skills);

      const res = await onJoin({
        name: name.trim(),
        position: derived.primaryPosition,
        rating: derived.primaryRating,
        skills
      });

      if (res && res.success && res.player) {
        try {
          const myIds = JSON.parse(localStorage.getItem('my_added_players') || '[]');
          myIds.push(res.player.id);
          localStorage.setItem('my_added_players', JSON.stringify(myIds));
        } catch {}

        setName('');
        setSkills({ FW: 'B', MF: 'B', DF: 'B', GK: 'B' });
        setIsOpen(false);

        const summary = derived.strongPositions.length > 0 
          ? derived.strongPositions.join(', ') 
          : 'Đa năng (Mức B)';

        showToast?.(`⚽ Đã thêm "${res.player.name}" [${summary}] vào trận đấu!`);
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
      color: '#FF4757',
      borderActive: '#FF4757',
      icon: <Crosshair size={18} strokeWidth={2.2} />
    },
    MF: {
      id: 'MF',
      label: 'Tiền vệ',
      color: '#00F298',
      borderActive: '#00F298',
      icon: <Activity size={18} strokeWidth={2.2} />
    },
    DF: {
      id: 'DF',
      label: 'Hậu vệ',
      color: '#38BDF8',
      borderActive: '#38BDF8',
      icon: <Shield size={18} strokeWidth={2.2} />
    },
    GK: {
      id: 'GK',
      label: 'Thủ môn',
      color: '#F59E0B',
      borderActive: '#F59E0B',
      icon: <Hand size={18} strokeWidth={2.2} />
    }
  };

  // Tier buttons definition
  const TIER_OPTIONS = [
    { 
      id: 'S', 
      label: 'S', 
      color: '#FFD700', 
      activeBg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(200, 140, 10, 0.1))', 
      border: '#FFD700' 
    },
    { 
      id: 'A', 
      label: 'A', 
      color: '#A78BFA', 
      activeBg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(124, 58, 237, 0.1))', 
      border: '#A78BFA' 
    },
    { 
      id: 'B', 
      label: 'B', 
      color: '#00F298', 
      activeBg: 'linear-gradient(135deg, rgba(0, 242, 152, 0.22), rgba(5, 150, 105, 0.1))', 
      border: '#00F298' 
    },
    { 
      id: 'C', 
      label: 'C', 
      color: '#38BDF8', 
      activeBg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(37, 99, 235, 0.1))', 
      border: '#38BDF8' 
    }
  ];

  return (
    <div 
      className="clean-card" 
      style={{ 
        marginBottom: '12px', 
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
        <div style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          borderRadius: '10px',
          background: isLocked ? 'rgba(255, 71, 87, 0.12)' : 'rgba(0, 242, 152, 0.12)',
          border: isLocked ? '1px solid rgba(255, 71, 87, 0.25)' : '1px solid rgba(0, 242, 152, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.15rem'
        }}>
          {isLocked ? '🔒' : '⚽'}
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 800, 
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isLocked ? 'Kèo Đã Khóa Đăng Ký' : 'Điểm Danh Trận Đấu'}
          </h3>
        </div>
      </div>

      <button
        type="button"
        id="btn-open-join-modal"
        onClick={() => !isLocked && setIsOpen(true)}
        disabled={isLocked}
        style={{
          padding: '9px 18px',
          borderRadius: '12px',
          background: isLocked 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'linear-gradient(135deg, #00F298 0%, #00B96B 100%)',
          color: isLocked ? '#94A3B8' : '#04160E',
          border: isLocked 
            ? '1px dashed rgba(255, 255, 255, 0.15)' 
            : '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: isLocked 
            ? 'none' 
            : '0 4px 16px rgba(0, 242, 152, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          fontSize: '0.88rem',
          fontWeight: 800,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <UserPlus size={15} />
        <span>{isLocked ? 'Đã Khóa' : 'Tham Gia'}</span>
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
            zIndex: 999,
            padding: '12px',
            boxSizing: 'border-box'
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
              marginBottom: '16px', 
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: 'linear-gradient(135deg, rgba(0, 242, 152, 0.2) 0%, rgba(0, 185, 107, 0.08) 100%)',
                  border: '1px solid rgba(0, 242, 152, 0.35)',
                  color: '#00F298',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 242, 152, 0.18)'
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
                    Điểm Danh Tham Gia Kèo
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !loading && setIsOpen(false)}
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Field 1: Name (Required) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 700, margin: 0 }}>
                    Họ và tên cầu thủ: <span style={{ color: '#FF4757' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Bắt buộc
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '13px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}>
                    ✍️
                  </div>

                  <input 
                    type="text"
                    placeholder="Nhập tên..."
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
                      boxSizing: 'border-box',
                      background: 'rgba(13, 21, 33, 0.85)',
                      border: showError 
                        ? '1.5px solid #FF4757' 
                        : (hasName ? '1px solid rgba(0, 242, 152, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)'),
                      borderRadius: '12px',
                      padding: '11px 14px 11px 38px',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
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
                    fontSize: '0.72rem', 
                    color: '#FF6B81', 
                    marginTop: '5px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    background: 'rgba(255, 71, 87, 0.08)',
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 71, 87, 0.2)'
                  }}>
                    <AlertCircle size={13} />
                    <span>Bạn bắt buộc phải nhập họ tên để xác nhận tham gia!</span>
                  </div>
                )}
              </div>

              {/* Field 2: Multi-Position Capability Matrix */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 700, margin: 0 }}>
                    Thêm thông tin năng lực:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#00F298', fontWeight: 600 }}>
                    Mặc định: B
                  </span>
                </div>

                {/* Subtitle helper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.66rem',
                  color: '#94A3B8',
                  marginBottom: '8px',
                  padding: '0 4px',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
                  <span>Có thể chọn nhiều vị trí:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#FFD700', fontWeight: 700 }}>⭐ S: Gánh team</span>
                    <span style={{ color: '#A78BFA', fontWeight: 700 }}>⚡ A: Chắc chân</span>
                    <span style={{ color: '#00F298', fontWeight: 700 }}>🟢 B: Tròn vai</span>
                    <span style={{ color: '#38BDF8', fontWeight: 700 }}>⚪ C: Dưỡng sinh</span>
                  </div>
                </div>

                {/* 4 Rows: FW, MF, DF, GK */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.values(ROLE_CONFIGS).map((pos) => {
                    const currentTier = skills[pos.id] || 'B';

                    return (
                      <div
                        key={pos.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255, 255, 255, 0.025)',
                          border: currentTier !== 'B' 
                            ? `1px solid ${pos.borderActive}55` 
                            : '1px solid rgba(255, 255, 255, 0.07)',
                          borderRadius: '12px',
                          padding: '6px 8px',
                          gap: '8px',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Position badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '76px', flexShrink: 0 }}>
                          <div style={{
                            color: pos.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {pos.icon}
                          </div>
                          <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: pos.color }}>
                              {pos.id}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#64748B' }}>
                              {pos.label}
                            </div>
                          </div>
                        </div>

                        {/* 4 Segmented Buttons: S, A, B, Ổn */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', flex: 1, minWidth: 0 }}>
                          {TIER_OPTIONS.map(tier => {
                            const isActive = currentTier === tier.id;

                            return (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() => setSkills(prev => ({ ...prev, [pos.id]: tier.id }))}
                                style={{
                                  padding: '7px 2px',
                                  minWidth: 0,
                                  boxSizing: 'border-box',
                                  borderRadius: '8px',
                                  border: isActive ? `1.5px solid ${tier.border}` : '1px solid rgba(255, 255, 255, 0.07)',
                                  background: isActive ? tier.activeBg : 'rgba(255, 255, 255, 0.02)',
                                  color: isActive ? tier.color : '#64748B',
                                  fontWeight: isActive ? 800 : 600,
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: isActive ? `0 2px 8px ${tier.border}30` : 'none',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {tier.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  style={{ 
                    flex: 1, 
                    padding: '11px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#CBD5E1',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
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
                    padding: '11px', 
                    borderRadius: '12px',
                    fontSize: '0.92rem', 
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
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
                      <UserCheck size={16} />
                      <span>Xác Nhận Tham Gia ⚽</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Nhập tên để tham gia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
