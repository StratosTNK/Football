import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Calendar, 
  Lock, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle,
  MapPin,
  Phone,
  ExternalLink
} from 'lucide-react';
import { DANANG_PITCHES } from '../data/daNangPitches';

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  match, 
  onUpdateMatch, 
  onClearPlayers,
  onChangePassword,
  onOpenPitchFinder,
  showToast 
}) {
  const [activeTab, setActiveTab] = useState('setup'); // 'setup' | 'security'

  // Match setup form state
  const [title, setTitle] = useState(match.title || '');
  const [stadium, setStadium] = useState(match.stadium || '');
  const [location, setLocation] = useState(match.location || '');
  const [matchDate, setMatchDate] = useState(match.matchDate || '');
  const [matchTime, setMatchTime] = useState(match.matchTime || '');
  const [maxPlayers, setMaxPlayers] = useState(match.maxPlayers || 14);
  const [status, setStatus] = useState(match.status || 'OPEN');

  // Security
  const [newPassword, setNewPassword] = useState('');

  // Keep state synchronized with incoming match changes
  useEffect(() => {
    setTitle(match.title || '');
    setStadium(match.stadium || '');
    setLocation(match.location || '');
    setMatchDate(match.matchDate || '');
    setMatchTime(match.matchTime || '');
    setMaxPlayers(match.maxPlayers || 14);
    setStatus(match.status || 'OPEN');
  }, [match]);

  // Find matched pitch in Da Nang database
  const matchedPitch = DANANG_PITCHES.find(p => 
    stadium && (
      p.shortName.toLowerCase() === stadium.toLowerCase() || 
      p.name.toLowerCase().includes(stadium.toLowerCase()) || 
      stadium.toLowerCase().includes(p.shortName.toLowerCase())
    )
  );

  const handleQuickSelectPitch = (pitchId) => {
    if (!pitchId) {
      setStadium('');
      setLocation('');
      showToast?.('↩️ Đã xóa sân bóng (để trống).');
      return;
    }
    const pitch = DANANG_PITCHES.find(p => p.id === pitchId);
    if (pitch) {
      setStadium(pitch.shortName);
      setLocation(pitch.address);
      showToast?.(`🏟️ Đã chọn ${pitch.shortName}`);
    }
  };

  if (!isOpen) return null;

  const handleSaveSetup = async (e) => {
    e.preventDefault();
    try {
      await onUpdateMatch({
        title,
        stadium,
        location,
        matchDate,
        matchTime,
        maxPlayers,
        status,
        teamCount: match.teamCount || 2
      });
      showToast('✅ Đã cập nhật thông tin kèo đá bóng!');
    } catch {
      showToast('Lỗi khi lưu thông tin kèo.');
    }
  };

  const handleChangePasswordClick = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showToast('Mật khẩu tối thiểu 4 ký tự!');
      return;
    }
    try {
      await onChangePassword(newPassword);
      setNewPassword('');
      showToast('✅ Đã đổi mật khẩu Admin thành công!');
    } catch {
      showToast('Không thể đổi mật khẩu.');
    }
  };

  const handleClearAllPlayers = async () => {
    if (window.confirm('⚠️ Bạn có chắc muốn XÓA TOÀN BỘ danh sách cầu thủ để chuẩn bị cho trận mới tuần sau?')) {
      try {
        await onClearPlayers();
        showToast('Đã làm mới danh sách cầu thủ cho kèo mới!');
      } catch {
        showToast('Không thể làm mới danh sách.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-panel-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag Pill */}
        <div className="modal-drag-pill"></div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.2), rgba(0, 242, 152, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FCD34D'
            }}>
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Quản Trị Kèo Đá Banh</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>Admin Control Panel</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* 2-Column Responsive Tab Navigation */}
        <div className="admin-tabs-grid">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`admin-tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
          >
            <Calendar size={16} />
            <span>Lịch Đá & Sân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>Cài Đặt Hệ Thống</span>
          </button>
        </div>

        {/* TAB 1: SETUP MATCH */}
        {activeTab === 'setup' && (
          <form onSubmit={handleSaveSetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Tiêu đề trận đấu:
              </label>
              <input 
                type="text" 
                className="clean-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="VD: Kèo Sân 7 Phúc Đạt Tối Thứ 5" 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Ngày đá:
                </label>
                <input 
                  type="date" 
                  className="clean-input" 
                  value={matchDate} 
                  onChange={(e) => setMatchDate(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Giờ đá dự kiến:
                </label>
                <input 
                  type="text" 
                  className="clean-input" 
                  value={matchTime} 
                  onChange={(e) => setMatchTime(e.target.value)} 
                  placeholder="19:30 - 21:00" 
                  required 
                />
              </div>
            </div>

            {/* Quick Pitch Selector from Da Nang Database */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} />
                    <span>Chọn nhanh sân bóng Đà Nẵng:</span>
                  </label>
                  {stadium && (
                    <button
                      type="button"
                      onClick={() => {
                        setStadium('');
                        setLocation('');
                        showToast?.('↩️ Đã bỏ chọn sân bóng (để trống).');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FF6B81',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        padding: '0',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}
                      title="Bấm để xóa sân bóng, để trống"
                    >
                      ✕ Bỏ chọn sân
                    </button>
                  )}
                </div>

                {onOpenPitchFinder && (
                  <button
                    type="button"
                    onClick={onOpenPitchFinder}
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--emerald)', borderColor: 'rgba(0, 242, 152, 0.4)' }}
                  >
                    Xem Chi Tiết Sân →
                  </button>
                )}
              </div>

              <select
                className="clean-input"
                style={{ fontSize: '0.82rem', padding: '8px 10px', background: '#0F1A28' }}
                value={matchedPitch ? matchedPitch.id : ''}
                onChange={(e) => handleQuickSelectPitch(e.target.value)}
              >
                <option value="">-- Để trống sân bóng / Chưa chốt sân --</option>
                {DANANG_PITCHES.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Hotline: {p.phone})
                  </option>
                ))}
              </select>

              {matchedPitch && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: '#CBD5E1',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={12} color="var(--emerald)" />
                    <span>Hotline: <strong style={{ color: '#fff' }}>{matchedPitch.phone}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <a
                      href={`tel:${matchedPitch.phone.replace(/\s+/g, '')}`}
                      className="btn"
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        background: 'var(--emerald)',
                        color: '#03140C',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      Gọi Sân
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(matchedPitch.phone.replace(/\s+/g, ''));
                        showToast(`📞 Đã chép số điện thoại ${matchedPitch.phone}`);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                    >
                      Chép SĐT
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Tên sân bóng:
                </label>
                <input 
                  type="text" 
                  className="clean-input" 
                  value={stadium} 
                  onChange={(e) => setStadium(e.target.value)} 
                  placeholder="Để trống nếu chưa chốt sân" 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Giới hạn số cầu thủ:
                </label>
                <input 
                  type="number" 
                  className="clean-input" 
                  value={maxPlayers} 
                  onChange={(e) => setMaxPlayers(e.target.value)} 
                  placeholder="14" 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Địa chỉ sân:
              </label>
              <input 
                type="text" 
                className="clean-input" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="Để trống nếu chưa có địa chỉ" 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Trạng thái đăng ký:
              </label>
              <select
                className="clean-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="OPEN">🟢 Mở đăng ký tự do</option>
                <option value="LOCKED">🔴 Khóa đăng ký (Đã đủ người)</option>
                <option value="BALANCED">🔵 Đã chia đội</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '6px' }}>
              <Check size={18} /> Lưu Cài Đặt Trận Đấu
            </button>
          </form>
        )}

        {/* TAB 2: SECURITY & RESET */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Change Password */}
            <form onSubmit={handleChangePasswordClick} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Đổi Mật Khẩu Admin</h4>
              <input 
                type="password" 
                className="clean-input" 
                placeholder="Nhập mật khẩu Admin mới..." 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="submit" className="btn-secondary" style={{ padding: '10px' }}>
                <Lock size={15} /> Cập Nhật Mật Khẩu
              </button>
            </form>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Clear all players for new match */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Khu Vực Nguy Hiểm (Làm Mới Trận)
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '6px 0 12px 0' }}>
                Xóa sạch danh sách cầu thủ điểm danh của trận này để bắt đầu nhận đăng ký cho trận đá bóng tuần sau.
              </p>
              <button
                type="button"
                onClick={handleClearAllPlayers}
                className="btn-danger"
                style={{ padding: '10px 16px', width: '100%', justifyContent: 'center' }}
              >
                <Trash2 size={16} /> Xóa Sạch Danh Sách (Chuẩn Bị Kèo Mới)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
