import React, { useState } from 'react';
import { Users, Edit2, Trash2, Check, X, Shuffle, AlertCircle } from 'lucide-react';

export default function PlayerList({ 
  match, 
  isAdmin, 
  myAddedIds = [],
  onEditPlayer, 
  onDeletePlayer,
  onLeavePlayer,
  onRandomSplit, 
  showToast 
}) {
  const { players = [] } = match;
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmPlayer, setConfirmPlayer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const startEdit = (player) => {
    setEditingId(player.id);
    setEditName(player.name);
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
      await onEditPlayer(playerId, editName.trim());
      setEditingId(null);
      showToast('Đã lưu tên cầu thủ.');
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

        {/* Quick Admin Split Button right above the list */}
        {isAdmin && players.length >= 2 && (
          <button
            onClick={() => onRandomSplit(match.teamCount || 2)}
            className="btn btn-primary"
            style={{ padding: '5px 12px', fontSize: '0.82rem' }}
          >
            <Shuffle size={14} /> Bốc Thăm Chia Đội
          </button>
        )}
      </div>

      {/* Players List */}
      {players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Chưa có ai điểm danh. Hãy nhập tên ở trên để tham gia! ⚽
        </div>
      ) : (
        <div className="player-grid">
          {players.map((player, idx) => {
            const isEditing = editingId === player.id;
            const isMyAdded = myAddedIds.includes(player.id);
            // Can remove: Admin can remove anytime; Guests can remove when match is OPEN
            const canRemove = isAdmin || match.status === 'OPEN';

            return (
              <div key={player.id} className="player-item">
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald)' }}>#{idx + 1}</span>
                    <input 
                      type="text" 
                      className="clean-input" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                      autoFocus
                    />
                    <button 
                      onClick={() => saveEdit(player.id)} 
                      className="btn btn-primary"
                      style={{ padding: '4px 6px' }}
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={cancelEdit} 
                      className="btn btn-secondary"
                      style={{ padding: '4px 6px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: 'var(--text-dim)',
                        minWidth: '20px'
                      }}>
                        #{idx + 1}
                      </span>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                          {player.name}
                        </span>
                        {isMyAdded && (
                          <span style={{ 
                            fontSize: '0.68rem', 
                            color: 'var(--emerald)', 
                            background: 'rgba(0, 242, 152, 0.12)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '6px',
                            fontWeight: 700
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
                          title="Sửa tên"
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
