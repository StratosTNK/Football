import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Shuffle, 
  AlertCircle,
  Crosshair,
  Activity,
  Shield,
  Hand,
  Receipt
} from 'lucide-react';
import { POSITIONS, RATINGS, derivePlayerAttributes } from '../utils/teamBalancer';
import Portal from './Portal';

// Role visual configuration matching registration modal
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

// Tier buttons definition matching registration modal
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

export default function PlayerList({ 
  match, 
  isAdmin, 
  myAddedIds = [],
  onEditPlayer, 
  onDeletePlayer,
  onLeavePlayer,
  onRandomSplit, 
  showToast,
  externalSplitOpen,
  setExternalSplitOpen,
  onOpenPitchBill
}) {
  const { players = [] } = match;
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSkills, setEditSkills] = useState({ FW: 'B', MF: 'B', DF: 'B', GK: 'B' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(false);
  const [confirmPlayer, setConfirmPlayer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [teamCount, setTeamCount] = useState(match.teamCount || 2);
  const [splitting, setSplitting] = useState(false);
  const [internalSplitOpen, setInternalSplitOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const showSplitCard = externalSplitOpen !== undefined ? externalSplitOpen : internalSplitOpen;
  const setShowSplitCard = setExternalSplitOpen || setInternalSplitOpen;

  useEffect(() => {
    if (match.teamCount) {
      setTeamCount(match.teamCount);
    }
  }, [match.teamCount]);

  const handleSplitClick = async () => {
    if (players.length < 2) {
      showToast('Cần ít nhất 2 cầu thủ để chia đội!');
      return;
    }
    setSplitting(true);
    try {
      await onRandomSplit(teamCount);
      showToast(`🎲 Đã phân chia ${teamCount} đội công bằng theo trình độ và vị trí!`);
      setShowSplitCard(false);
    } catch (err) {
      showToast(err.message || 'Lỗi khi chia đội.');
    } finally {
      setSplitting(false);
    }
  };

  const startEdit = (player) => {
    setEditingPlayer(player);
    setEditName(player.name || '');
    setEditError(false);

    let currentSkills = { FW: 'B', MF: 'B', DF: 'B', GK: 'B' };
    if (player.skills && typeof player.skills === 'object') {
      currentSkills = {
        FW: player.skills.FW === 'Ổn' ? 'B' : (player.skills.FW || 'B'),
        MF: player.skills.MF === 'Ổn' ? 'B' : (player.skills.MF || 'B'),
        DF: player.skills.DF === 'Ổn' ? 'B' : (player.skills.DF || 'B'),
        GK: player.skills.GK === 'Ổn' ? 'B' : (player.skills.GK || 'B'),
      };
    } else if (player.position) {
      const r = player.rating === 'Ổn' ? 'B' : (player.rating || 'B');
      currentSkills[player.position] = r;
    }
    setEditSkills(currentSkills);
  };

  const saveEdit = async () => {
    if (!editingPlayer) return;
    if (!editName.trim()) {
      setEditError(true);
      showToast?.('⚠️ Tên không được để trống!');
      return;
    }
    setSavingEdit(true);
    try {
      const derived = derivePlayerAttributes(editSkills);
      await onEditPlayer(editingPlayer.id, {
        name: editName.trim(),
        skills: editSkills,
        position: derived.primaryPosition,
        rating: derived.primaryRating
      });
      setEditingPlayer(null);
      showToast?.(`✅ Đã cập nhật thông tin cầu thủ "${editName.trim()}".`);
    } catch (err) {
      showToast?.(err.message || 'Lỗi lưu thông tin.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!confirmPlayer) return;
    setDeleting(true);
    try {
      if (isAdmin && onDeletePlayer) {
        await onDeletePlayer(confirmPlayer.id);
      } else if (onLeavePlayer) {
        await onLeavePlayer(confirmPlayer.id);
      }
      showToast(`Đã xóa "${confirmPlayer.name}" khỏi danh sách.`);
      setConfirmPlayer(null);
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa cầu thủ.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="clean-card" style={{ padding: '14px 16px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={16} color="var(--emerald)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Danh Sách Điểm Danh ({players.length})
          </h3>
        </div>

        {/* Header Actions: Pitch Bill + Chia Đội */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Thanh toán tiền sân button */}
          {(isAdmin || (match?.pitchBill && match.pitchBill.totalAmount > 0)) && (
            <button
              type="button"
              onClick={onOpenPitchBill}
              className="btn btn-header"
              style={{
                padding: '5px 11px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.18), rgba(255, 138, 0, 0.12))',
                border: '1px solid rgba(255, 184, 0, 0.45)',
                color: '#FFB800',
                cursor: 'pointer'
              }}
              title={isAdmin ? "Thanh toán & chia tiền sân, tiền nước cho anh em" : "Xem bảng chia tiền sân & mã QR chuyển khoản"}
            >
              <Receipt size={13} />
              <span>{match?.pitchBill?.perPlayer ? `Tiền Sân (${Math.round(match.pitchBill.perPlayer / 1000)}k)` : 'Thanh Toán Tiền Sân'}</span>
            </button>
          )}

          {/* Small button like header to toggle the split card */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowSplitCard(!showSplitCard)}
              className="btn btn-header btn-header-music-on"
              style={{
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Shuffle size={13} />
              <span>Chia Đội</span>
              <span style={{ fontSize: '0.62rem', transform: showSplitCard ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Team Division Section (Only unfolded when showSplitCard is true) */}
      {isAdmin && showSplitCard && (
        <div id="team-split-card" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(0, 242, 152, 0.22)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '14px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shuffle size={15} color="var(--emerald)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                Bốc Thăm Chia Đội
              </span>
              <span style={{
                fontSize: '0.66rem',
                background: 'rgba(0, 242, 152, 0.15)',
                color: 'var(--emerald)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                Admin
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {players.length >= 2 ? (
                <span>~<strong>{Math.floor(players.length / teamCount)} - {Math.ceil(players.length / teamCount)}</strong> người/đội</span>
              ) : (
                <span style={{ color: '#FFA502' }}>(Cần ≥ 2 người)</span>
              )}
            </div>
          </div>

          {/* 2 Teams vs 3 Teams Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <button
              type="button"
              onClick={() => setTeamCount(2)}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-sm)',
                border: teamCount === 2 ? '2px solid var(--emerald)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: teamCount === 2 ? 'rgba(0, 242, 152, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              {teamCount === 2 && (
                <span style={{ position: 'absolute', top: '5px', right: '6px', color: 'var(--emerald)' }}>
                  <Check size={14} />
                </span>
              )}
              <div style={{ fontSize: '1.05rem' }}>🔴 vs 🔵</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', color: teamCount === 2 ? 'var(--emerald)' : '#fff' }}>
                Chia 2 Đội
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Đỏ vs Xanh</div>
            </button>

            <button
              type="button"
              onClick={() => setTeamCount(3)}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-sm)',
                border: teamCount === 3 ? '2px solid var(--emerald)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: teamCount === 3 ? 'rgba(0, 242, 152, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              {teamCount === 3 && (
                <span style={{ position: 'absolute', top: '5px', right: '6px', color: 'var(--emerald)' }}>
                  <Check size={14} />
                </span>
              )}
              <div style={{ fontSize: '1.05rem' }}>🔴 vs 🔵 vs 🟡</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', color: teamCount === 3 ? 'var(--emerald)' : '#fff' }}>
                Chia 3 Đội
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Xoay vòng 3 đội</div>
            </button>
          </div>

          {/* Large Action Split Button */}
          <button
            type="button"
            onClick={handleSplitClick}
            disabled={players.length < 2 || splitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '0.92rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              opacity: players.length < 2 ? 0.5 : 1,
              cursor: players.length < 2 ? 'not-allowed' : 'pointer',
              boxShadow: players.length >= 2 ? '0 4px 15px rgba(0, 242, 152, 0.25)' : 'none'
            }}
          >
            <Shuffle size={16} />
            <span>
              {splitting 
                ? 'Đang bốc thăm...' 
                : players.length < 2 
                  ? 'Cần ít nhất 2 cầu thủ để chia' 
                  : `BỐC THĂM CHIA ${teamCount} ĐỘI CÔNG BẰNG`}
            </span>
          </button>

          <div style={{
            fontSize: '0.71rem',
            color: '#38BDF8',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(56, 189, 248, 0.08)',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            <span>⚖️</span>
            <span>Thuật toán tự động cân bằng trình độ (S/A/B) và vị trí sở trường (GK/DF/MF/FW) đều cho các đội.</span>
          </div>
        </div>
      )}

      {/* Players List */}
      {players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Chưa có ai điểm danh. Hãy nhập tên ở trên để tham gia! ⚽
        </div>
      ) : (
        <>
          <div className="player-grid">
            {players.map((player, idx) => {
              const isMyAdded = myAddedIds.includes(player.id);
              // Can remove: Admin can remove anytime; Guests can remove when match is OPEN
              const canRemove = isAdmin || match.status === 'OPEN';

              return (
                <div key={player.id} className="player-item">
                      <div 
                        onClick={() => setSelectedPlayer(player)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          overflow: 'hidden', 
                          flex: 1,
                          cursor: 'pointer',
                          minWidth: 0,
                          padding: '2px 0'
                        }}
                        title="Bấm để xem vị trí & trình độ thi đấu"
                      >
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: 'var(--text-dim)',
                          minWidth: '22px',
                          flexShrink: 0
                        }}>
                          #{idx + 1}
                        </span>

                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          minWidth: 0
                        }}>
                          <span style={{ 
                            fontSize: '0.92rem', 
                            fontWeight: 700, 
                            color: '#FFFFFF'
                          }}>
                            {player.name}
                          </span>

                          {isMyAdded && (
                            <span style={{ 
                              fontSize: '0.65rem', 
                              color: 'var(--emerald)', 
                              background: 'rgba(0, 242, 152, 0.12)',
                              border: '1px solid rgba(0, 242, 152, 0.25)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              Bạn
                            </span>
                          )}

                          <span style={{ 
                            fontSize: '0.7rem', 
                            color: '#64748B', 
                            opacity: 0.75,
                            flexShrink: 0
                          }}>
                            ℹ️
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
                        {isAdmin && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(player);
                            }}
                            style={{ background: 'none', border: 'none', color: '#FFA502', cursor: 'pointer', padding: '4px' }}
                            title="Sửa thông tin cầu thủ"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                        {canRemove && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmPlayer(player);
                            }}
                            style={{ 
                              background: isMyAdded ? 'rgba(255, 107, 129, 0.15)' : 'none', 
                              border: isMyAdded ? '1px solid rgba(255, 107, 129, 0.3)' : 'none', 
                              color: '#FF6B81', 
                              cursor: 'pointer', 
                              padding: isMyAdded ? '3px 7px' : '4px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title={isMyAdded ? 'Hủy đăng ký của bạn' : 'Hủy đăng ký cầu thủ này'}
                          >
                            <Trash2 size={13} />
                            {isMyAdded && <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Hủy</span>}
                          </button>
                        )}
                      </div>
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Sleek In-App Confirmation Modal (Fixes window.confirm blocked on mobile/Zalo) */}
      {confirmPlayer && (
        <Portal>
          <div className="modal-overlay" onClick={() => !deleting && setConfirmPlayer(null)}>
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()} 
              style={{ maxWidth: '350px', textAlign: 'center', margin: 'auto' }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 107, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                color: '#FF6B81'
              }}>
                <AlertCircle size={24} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                Hủy Điểm Danh?
              </h3>
              
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
                Bạn có chắc muốn xóa <strong style={{ color: '#fff' }}>"{confirmPlayer.name}"</strong> khỏi danh sách trận đấu?
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setConfirmPlayer(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                  disabled={deleting}
                >
                  Quay Lại
                </button>
                <button
                  onClick={handleExecuteDelete}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    background: 'linear-gradient(135deg, #FF6B81, #EE5253)', 
                    color: '#fff',
                    fontWeight: 700 
                  }}
                  disabled={deleting}
                >
                  {deleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Sleek Player Profile Modal (Vị trí & Trình độ thi đấu khi click vào tên) */}
      {selectedPlayer && (
        <Portal>
          <div 
            className="modal-overlay" 
            onClick={() => setSelectedPlayer(null)}
          >
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                maxWidth: '380px', 
                width: '100%',
                maxHeight: 'calc(100dvh - 24px)',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                boxSizing: 'border-box',
                padding: '16px 14px',
                animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'linear-gradient(175deg, #111B2B 0%, #0A101A 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderTop: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '20px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 242, 152, 0.08)',
                margin: 'auto'
              }}
            >
              {/* Modal Header */}
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
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, rgba(0, 242, 152, 0.2) 0%, rgba(0, 185, 107, 0.08) 100%)',
                    border: '1px solid rgba(0, 242, 152, 0.35)',
                    color: '#00F298',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 14px rgba(0, 242, 152, 0.18)'
                  }}>
                    ⚽
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                        {selectedPlayer.name}
                      </h3>
                      {myAddedIds.includes(selectedPlayer.id) && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: 'var(--emerald)', 
                          background: 'rgba(0, 242, 152, 0.15)',
                          border: '1px solid rgba(0, 242, 152, 0.25)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          Bạn
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                      Vị trí & Năng lực thi đấu
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
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

              {/* 4 Positions Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {['FW', 'MF', 'DF', 'GK'].map(posKey => {
                  const pos = POSITIONS[posKey] || POSITIONS.MF;
                  const rawTier = (selectedPlayer.skills && selectedPlayer.skills[posKey])
                    ? selectedPlayer.skills[posKey]
                    : (selectedPlayer.position === posKey ? selectedPlayer.rating : 'B');
                  const tierKey = rawTier === 'Ổn' ? 'B' : (rawTier || 'B');
                  const tier = RATINGS[tierKey] || RATINGS.B;
                  const isHighlight = tierKey === 'S' || tierKey === 'A';

                  return (
                    <div
                      key={posKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: isHighlight 
                          ? 'rgba(255, 255, 255, 0.04)' 
                          : 'rgba(255, 255, 255, 0.02)',
                        border: isHighlight 
                          ? `1px solid ${pos.border}` 
                          : '1px solid rgba(255, 255, 255, 0.07)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{pos.icon}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: pos.color }}>
                            {pos.id}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 600 }}>
                            {pos.name}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: tier.bg,
                        border: `1px solid ${tier.border}`,
                        color: tier.color,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        boxShadow: tierKey === 'S' ? '0 0 10px rgba(255, 215, 0, 0.25)' : 'none'
                      }}>
                        <span>{tier.star}</span>
                        <span>{tierKey}</span>
                        <span style={{ opacity: 0.9, fontWeight: 600, fontSize: '0.74rem' }}>
                          • {tier.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons in Profile Modal */}
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700
                  }}
                >
                  Đóng
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const p = selectedPlayer;
                      setSelectedPlayer(null);
                      startEdit(p);
                    }}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.2), rgba(230, 126, 34, 0.15))',
                      border: '1px solid rgba(255, 165, 2, 0.4)',
                      color: '#FFA502',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={15} />
                    <span>Chỉnh Sửa</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit Player Modal (Dạng bảng năng lực 4x4 như Tham Gia) */}
      {editingPlayer && (
        <Portal>
          <div 
            className="modal-overlay" 
            onClick={() => !savingEdit && setEditingPlayer(null)}
          >
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                maxWidth: '460px', 
                width: '100%',
                maxHeight: 'calc(100dvh - 24px)',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                boxSizing: 'border-box',
                padding: '16px 14px',
                animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'linear-gradient(175deg, #111B2B 0%, #0A101A 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderTop: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '20px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 242, 152, 0.08)',
                margin: 'auto'
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
                  background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.2) 0%, rgba(230, 126, 34, 0.08) 100%)',
                  border: '1px solid rgba(255, 165, 2, 0.35)',
                  color: '#FFA502',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(255, 165, 2, 0.18)'
                }}>
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
                    Chỉnh Sửa Cầu Thủ
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                    Cập nhật họ tên và năng lực từng vị trí
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !savingEdit && setEditingPlayer(null)}
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

            {/* Edit Form */}
            <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Field 1: Name */}
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
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editError && e.target.value.trim()) setEditError(false);
                    }}
                    maxLength={40}
                    required
                    autoFocus
                    disabled={savingEdit}
                    style={{ 
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(13, 21, 33, 0.85)',
                      border: editError 
                        ? '1.5px solid #FF4757' 
                        : (editName.trim() ? '1px solid rgba(0, 242, 152, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)'),
                      borderRadius: '12px',
                      padding: '11px 14px 11px 38px',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxShadow: editError 
                        ? '0 0 0 3px rgba(255, 71, 87, 0.15)' 
                        : (editName.trim() ? '0 0 0 3px rgba(0, 242, 152, 0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.3)'),
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>

                {editError && (
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
                    <span>Họ và tên không được để trống!</span>
                  </div>
                )}
              </div>

              {/* Field 2: Multi-Position Capability Matrix */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 700, margin: 0 }}>
                    Thông tin năng lực theo vị trí:
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
                  <span>Chọn mức độ từng vị trí:</span>
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
                    const currentTier = editSkills[pos.id] || 'B';

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '70px', flexShrink: 0 }}>
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

                        {/* 4 Segmented Buttons: S, A, B, C */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', flex: 1, minWidth: 0 }}>
                          {TIER_OPTIONS.map(tier => {
                            const isActive = currentTier === tier.id;

                            return (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() => setEditSkills(prev => ({ ...prev, [pos.id]: tier.id }))}
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
                  onClick={() => setEditingPlayer(null)}
                  disabled={savingEdit}
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
                  <span>Hủy</span>
                </button>

                <button
                  type="submit"
                  disabled={savingEdit || !editName.trim()}
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
                    ...(editName.trim() ? {
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
                  {savingEdit ? (
                    <span>Đang lưu...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Lưu Thay Đổi ⚽</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
