import React, { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, Check, X, Shuffle, AlertCircle } from 'lucide-react';
import { POSITIONS, RATINGS } from '../utils/teamBalancer';

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
  setExternalSplitOpen
}) {
  const { players = [] } = match;
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('MF');
  const [editRating, setEditRating] = useState('A');
  const [confirmPlayer, setConfirmPlayer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [teamCount, setTeamCount] = useState(match.teamCount || 2);
  const [splitting, setSplitting] = useState(false);
  const [internalSplitOpen, setInternalSplitOpen] = useState(false);

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
    setEditingId(player.id);
    setEditName(player.name);
    setEditPosition(player.position || 'MF');
    setEditRating(player.rating || 'A');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (playerId) => {
    if (!editName.trim()) {
      showToast('Tên không được để trống!');
      return;
    }
    try {
      await onEditPlayer(playerId, {
        name: editName.trim(),
        position: editPosition,
        rating: editRating
      });
      setEditingId(null);
      showToast('Đã lưu thông tin cầu thủ.');
    } catch {
      showToast('Lỗi lưu thông tin.');
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
          {/* Team Composition Overview Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '0.72rem',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Vị trí:</span>
              <span style={{ color: POSITIONS.GK.color, fontWeight: 700 }}>🧤 {players.filter(p => (p.position || 'MF') === 'GK').length} GK</span>
              <span style={{ color: POSITIONS.DF.color, fontWeight: 700 }}>🛡️ {players.filter(p => (p.position || 'MF') === 'DF').length} DF</span>
              <span style={{ color: POSITIONS.MF.color, fontWeight: 700 }}>⚽ {players.filter(p => (p.position || 'MF') === 'MF').length} MF</span>
              <span style={{ color: POSITIONS.FW.color, fontWeight: 700 }}>🎯 {players.filter(p => (p.position || 'MF') === 'FW').length} FW</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Trình độ:</span>
              <span style={{ color: RATINGS.S.color, fontWeight: 800 }}>⭐ {players.filter(p => (p.rating || 'A') === 'S').length} S</span>
              <span style={{ color: RATINGS.A.color, fontWeight: 800 }}>⚡ {players.filter(p => (p.rating || 'A') === 'A').length} A</span>
              <span style={{ color: RATINGS.B.color, fontWeight: 800 }}>🟢 {players.filter(p => (p.rating || 'A') === 'B').length} B</span>
            </div>
          </div>

          <div className="player-grid">
            {players.map((player, idx) => {
              const isEditing = editingId === player.id;
              const isMyAdded = myAddedIds.includes(player.id);
              // Can remove: Admin can remove anytime; Guests can remove when match is OPEN
              const canRemove = isAdmin || match.status === 'OPEN';
              const pos = POSITIONS[player.position] || POSITIONS.MF;
              const rat = RATINGS[player.rating] || RATINGS.A;

              return (
                <div key={player.id} className="player-item">
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald)' }}>#{idx + 1}</span>
                        <input 
                          type="text" 
                          className="clean-input" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.85rem', flex: 1 }}
                          autoFocus
                        />
                        <button 
                          onClick={() => saveEdit(player.id)} 
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={cancelEdit} 
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.74rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Vị trí:</span>
                        <select 
                          value={editPosition} 
                          onChange={(e) => setEditPosition(e.target.value)}
                          className="clean-input"
                          style={{ padding: '2px 6px', fontSize: '0.74rem' }}
                        >
                          <option value="FW">🎯 FW - Tiền đạo</option>
                          <option value="MF">⚽ MF - Tiền vệ</option>
                          <option value="DF">🛡️ DF - Hậu vệ</option>
                          <option value="GK">🧤 GK - Thủ môn</option>
                        </select>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>Trình độ:</span>
                        <select 
                          value={editRating} 
                          onChange={(e) => setEditRating(e.target.value)}
                          className="clean-input"
                          style={{ padding: '2px 6px', fontSize: '0.74rem' }}
                        >
                          <option value="S">⭐ S - Đá hay, toàn diện</option>
                          <option value="A">⚡ A - Biết đá, 1 sở trường</option>
                          <option value="B">🟢 B - Biết nhưng chưa tốt</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: 'var(--text-dim)',
                          minWidth: '20px'
                        }}>
                          #{idx + 1}
                        </span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                            {player.name}
                          </span>

                          {/* Multi-position or single position badges */}
                          {(() => {
                            const strongPicks = player.skills && typeof player.skills === 'object'
                              ? Object.entries(player.skills).filter(([_, v]) => v && v !== 'Ổn')
                              : [];

                            if (strongPicks.length > 0) {
                              return strongPicks.map(([posKey, ratKey]) => {
                                const pPos = POSITIONS[posKey] || POSITIONS.MF;
                                const pRat = RATINGS[ratKey] || RATINGS.A;
                                return (
                                  <span key={posKey} style={{
                                    fontSize: '0.64rem',
                                    fontWeight: 800,
                                    color: pPos.color,
                                    background: pPos.badgeBg,
                                    border: `1px solid ${pPos.border}`,
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    flexShrink: 0
                                  }} title={`${pPos.name} • Hạng ${ratKey}`}>
                                    <span>{pPos.icon}</span>
                                    <span>{pPos.id}</span>
                                    <span style={{ color: pRat.color, marginLeft: '1px' }}>{ratKey}</span>
                                  </span>
                                );
                              });
                            }

                            // If all 'Ổn' or legacy format
                            return (
                              <>
                                <span style={{
                                  fontSize: '0.64rem',
                                  fontWeight: 800,
                                  color: pos.color,
                                  background: pos.badgeBg,
                                  border: `1px solid ${pos.border}`,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  flexShrink: 0
                                }} title={pos.name}>
                                  <span>{pos.icon}</span>
                                  <span>{pos.id}</span>
                                </span>

                                <span style={{
                                  fontSize: '0.64rem',
                                  fontWeight: 800,
                                  color: rat.color,
                                  background: rat.bg,
                                  border: `1px solid ${rat.border}`,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  flexShrink: 0,
                                  boxShadow: rat.id === 'S' ? '0 0 6px rgba(255, 215, 0, 0.4)' : 'none'
                                }} title={rat.desc}>
                                  <span>{rat.star}</span>
                                  <span>{rat.id}</span>
                                </span>
                              </>
                            );
                          })()}

                          {isMyAdded && (
                            <span style={{ 
                              fontSize: '0.65rem', 
                              color: 'var(--emerald)', 
                              background: 'rgba(0, 242, 152, 0.12)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              Bạn
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {isAdmin && (
                          <button 
                            onClick={() => startEdit(player)}
                            style={{ background: 'none', border: 'none', color: '#FFA502', cursor: 'pointer', padding: '4px' }}
                            title="Sửa thông tin cầu thủ"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                      {canRemove && (
                        <button 
                          onClick={() => setConfirmPlayer(player)}
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
                  </>
                )}
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Sleek In-App Confirmation Modal (Fixes window.confirm blocked on mobile/Zalo) */}
      {confirmPlayer && (
        <div className="modal-overlay" onClick={() => !deleting && setConfirmPlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px', textAlign: 'center' }}>
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
      )}
    </div>
  );
}
