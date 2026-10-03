import React, { useState } from 'react';
import { POSITIONS, RATINGS } from '../utils/teamBalancer';
import { UserPlus, X, Check, AlertCircle } from 'lucide-react';

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
        setIsOpen(false); // Automatically close modal after joining

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

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Primary Trigger Button: THAM GIA */}
      <button
        type="button"
        id="btn-open-join-modal"
        onClick={() => !isLocked && setIsOpen(true)}
        disabled={isLocked}
        className="btn"
        style={{
          width: '100%',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          background: isLocked 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'linear-gradient(135deg, #00F298 0%, #00C875 100%)',
          color: isLocked ? '#FF6B81' : '#03140C',
          border: isLocked ? '1px dashed rgba(255, 107, 129, 0.4)' : 'none',
          boxShadow: isLocked ? 'none' : '0 4px 20px rgba(0, 242, 152, 0.35)',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>{isLocked ? '🔒' : '⚽'}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {isLocked ? 'KÈO ĐÃ KHÓA ĐĂNG KÝ' : 'THAM GIA'}
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>
              {isLocked ? 'Chốt sổ danh sách trận đấu' : 'Bấm vào để chọn vị trí & trình độ thi đấu'}
            </div>
          </div>
        </div>

        {!isLocked && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.22)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
          }}>
            <UserPlus size={15} />
            <span>Đăng Ký →</span>
          </div>
        )}
      </button>

      {/* Registration Modal Popup */}
      {isOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => !loading && setIsOpen(false)}
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '460px', 
              width: '94%',
              padding: '18px 20px',
              animation: 'modalSlideUp 0.2s ease',
              border: '1px solid rgba(0, 242, 152, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(0, 242, 152, 0.15)',
                  color: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  ⚽
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Điểm Danh Tham Gia Kèo
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Điền đầy đủ thông tin để chia đội công bằng
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !loading && setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Field 1: Name (Required) */}
              <div>
                <label style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Họ và tên cầu thủ: <span style={{ color: '#FF4757' }}>*</span>
                </label>
                <input 
                  type="text"
                  className="clean-input"
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
                    fontSize: '0.92rem', 
                    padding: '10px 12px',
                    borderColor: showError ? '#FF4757' : undefined 
                  }}
                />
                {showError && (
                  <div style={{ fontSize: '0.74rem', color: '#FF4757', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>Bạn bắt buộc phải nhập tên cầu thủ để tham gia!</span>
                  </div>
                )}
              </div>

              {/* Field 2: Position Selector (Required) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700, margin: 0 }}>
                    Vị trí sở trường: <span style={{ color: '#FF4757' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: POSITIONS[position]?.color, fontWeight: 700 }}>
                    {POSITIONS[position]?.icon} {POSITIONS[position]?.name}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {Object.values(POSITIONS).map((pos) => {
                    const isSelected = position === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPosition(pos.id)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${pos.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? pos.badgeBg : 'rgba(255, 255, 255, 0.03)',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.15rem' }}>{pos.icon}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? pos.color : '#fff' }}>
                          {pos.id}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                          {pos.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Rating Tier Selector (Required) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700, margin: 0 }}>
                    Mức đánh giá khả năng: <span style={{ color: '#FF4757' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: RATINGS[rating]?.color, fontWeight: 700 }}>
                    {RATINGS[rating]?.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {Object.values(RATINGS).map((rat) => {
                    const isSelected = rating === rat.id;
                    return (
                      <button
                        key={rat.id}
                        type="button"
                        onClick={() => setRating(rat.id)}
                        style={{
                          padding: '8px 6px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${rat.border}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? rat.bg : 'rgba(255, 255, 255, 0.03)',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected && rat.id === 'S' ? '0 0 10px rgba(255, 215, 0, 0.35)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{rat.star}</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isSelected ? rat.color : '#fff' }}>
                          Hạng {rat.id}
                        </span>
                        <span style={{ fontSize: '0.64rem', color: isSelected ? '#fff' : 'var(--text-muted)', lineHeight: 1.2 }}>
                          {rat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 4: Note (Optional) */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Ghi chú thêm (không bắt buộc):
                </label>
                <input 
                  type="text"
                  className="clean-input"
                  placeholder="VD: Đến trễ 10p, mang theo bạn..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={60}
                  disabled={loading}
                  style={{ fontSize: '0.82rem', padding: '7px 10px' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  id="btn-confirm-join"
                  disabled={loading || !name.trim()}
                  className="btn btn-primary"
                  style={{ 
                    flex: 2, 
                    padding: '11px', 
                    fontSize: '0.92rem', 
                    fontWeight: 800,
                    opacity: !name.trim() ? 0.45 : 1,
                    cursor: !name.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: !name.trim() ? 'none' : '0 4px 16px rgba(0, 242, 152, 0.35)'
                  }}
                >
                  {loading ? 'Đang gửi...' : 'Xác Nhận Tham Gia ⚽'}
                </button>
              </div>

              {!name.trim() && (
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '0.72rem', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: '-4px'
                }}>
                  ℹ️ Bạn cần điền họ tên bên trên để mở khóa nút tham gia
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
