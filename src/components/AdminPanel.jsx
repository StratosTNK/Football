import React, { useState } from 'react';
import { 
  Settings, 
  Shuffle, 
  Calendar, 
  UserPlus, 
  Lock, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  match, 
  onUpdateMatch, 
  onRandomSplit, 
  onResetTeams, 
  onAddPlayer, 
  onClearPlayers,
  onChangePassword,
  showToast 
}) {
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'setup' | 'add' | 'security'

  // Match setup form state
  const [title, setTitle] = useState(match.title || '');
  const [stadium, setStadium] = useState(match.stadium || '');
  const [location, setLocation] = useState(match.location || '');
  const [matchDate, setMatchDate] = useState(match.matchDate || '');
  const [matchTime, setMatchTime] = useState(match.matchTime || '');
  const [maxPlayers, setMaxPlayers] = useState(match.maxPlayers || 14);
  const [status, setStatus] = useState(match.status || 'OPEN');

  // Random split option
  const [teamCount, setTeamCount] = useState(match.teamCount || 2);

  // Manual player add state
  const [manualName, setManualName] = useState('');
  const [manualTeam, setManualTeam] = useState(0);

  // Security
  const [newPassword, setNewPassword] = useState('');

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
        teamCount
      });
      showToast('✅ Đã cập nhật thông tin kèo đá bóng!');
    } catch {
      showToast('Lỗi khi lưu thông tin kèo.');
    }
  };

  const handleRandomSplitClick = async () => {
    if (match.players.length < 2) {
      showToast('Cần ít nhất 2 cầu thủ để chia đội!');
      return;
    }
    try {
      await onRandomSplit(teamCount);
      showToast(`🎲 Đã chia ngẫu nhiên thành ${teamCount} đội!`);
      onClose(); // Close panel to view the divided teams
    } catch {
      showToast('Lỗi khi chia đội.');
    }
  };

  const handleAddManualPlayer = async (e) => {
    e.preventDefault();
    if (!manualName.trim()) {
      showToast('Vui lòng nhập tên cầu thủ!');
      return;
    }
    try {
      await onAddPlayer(manualName.trim(), manualTeam);
      setManualName('');
      showToast(`Đã thêm cầu thủ: ${manualName}!`);
    } catch {
      showToast('Lỗi khi thêm cầu thủ.');
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
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Quản Trị Kèo Đá Banh</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Admin Control Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '18px',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('split')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'split' ? 'var(--emerald-primary)' : 'transparent',
              color: activeTab === 'split' ? '#05160E' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            🎲 Chia Đội
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'setup' ? 'var(--emerald-primary)' : 'transparent',
              color: activeTab === 'setup' ? '#05160E' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ⏱️ Setup Giờ Đá
          </button>
          <button
            onClick={() => setActiveTab('add')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'add' ? 'var(--emerald-primary)' : 'transparent',
              color: activeTab === 'add' ? '#05160E' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ Thêm Cầu Thủ
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'security' ? 'var(--emerald-primary)' : 'transparent',
              color: activeTab === 'security' ? '#05160E' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ⚙️ Cài Đặt
          </button>
        </div>

        {/* TAB 1: RANDOM SPLIT */}
        {activeTab === 'split' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '10px' }}>
                Chọn số lượng đội muốn chia:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTeamCount(2)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: teamCount === 2 ? '2px solid var(--emerald-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: teamCount === 2 ? 'rgba(0, 242, 152, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.1rem' }}>🔴 vs 🔵</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Chia 2 Đội</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>(Đỏ vs Xanh)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTeamCount(3)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: teamCount === 3 ? '2px solid var(--emerald-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: teamCount === 3 ? 'rgba(0, 242, 152, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.1rem' }}>🔴 vs 🔵 vs 🟡</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Chia 3 Đội</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>(Xoay vòng 3 đội)</div>
                </button>
              </div>

              <div style={{ marginTop: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                👥 Hiện có <strong>{match.players.length}</strong> cầu thủ đã điểm danh.
                {match.players.length > 0 && (
                  <span> Trung bình mỗi đội sẽ có <strong>{Math.floor(match.players.length / teamCount)} - {Math.ceil(match.players.length / teamCount)}</strong> người.</span>
                )}
              </div>
            </div>

            <button
              onClick={handleRandomSplitClick}
              className="btn-primary"
              style={{ padding: '14px', fontSize: '1.05rem', width: '100%' }}
            >
              <Shuffle size={18} />
              🎲 BỐC THĂM CHIA ĐỘI NGẪU NHIÊN
            </button>

            {match.status === 'BALANCED' && (
              <button
                onClick={onResetTeams}
                className="btn-secondary"
                style={{ padding: '12px', width: '100%', color: '#F87171' }}
              >
                <RefreshCw size={16} />
                Hủy Phân Đội (Quay Lại Danh Sách Điểm Danh)
              </button>
            )}
          </div>
        )}

        {/* TAB 2: SETUP MATCH */}
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
                  placeholder="Sân Phúc Đạt" 
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
                placeholder="324 Chu Văn An, Bình Thạnh" 
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

        {/* TAB 3: ADD PLAYER MANUALLY */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddManualPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Nhập tên hộ cho các anh em không dùng smartphone hoặc đăng ký trực tiếp qua điện thoại.
            </p>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Tên cầu thủ:
              </label>
              <input 
                type="text" 
                className="clean-input" 
                placeholder="Nhập tên..." 
                value={manualName} 
                onChange={(e) => setManualName(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Gán sẵn vào đội (nếu đã chia):
              </label>
              <select 
                className="clean-input"
                value={manualTeam}
                onChange={(e) => setManualTeam(Number(e.target.value))}
              >
                <option value={0}>Chưa gán đội (Chờ bốc thăm)</option>
                <option value={1}>🔴 Đội 1 (Áo Đỏ)</option>
                <option value={2}>🔵 Đội 2 (Áo Xanh)</option>
                <option value={3}>🟡 Đội 3 (Áo Vàng)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
              <UserPlus size={18} /> Thêm Cầu Thủ Này
            </button>
          </form>
        )}

        {/* TAB 4: SECURITY & RESET */}
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
