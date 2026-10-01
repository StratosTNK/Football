import React, { useState } from 'react';
import { Users, Edit2, Trash2, Check, X, Shuffle } from 'lucide-react';

export default function PlayerList({ 
  match, 
  isAdmin, 
  onEditPlayer, 
  onDeletePlayer,
  onLeavePlayer,
  onRandomSplit, 
  showToast 
}) {
  const { players = [] } = match;
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  let myAddedIds = [];
  try {
    myAddedIds = JSON.parse(localStorage.getItem('my_added_players') || '[]');
  } catch {}

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

  const handleDelete = async (player) => {
    if (window.confirm(`Xóa "${player.name}" khỏi danh sách?`)) {
      try {
        if (isAdmin && onDeletePlayer) {
          await onDeletePlayer(player.id);
        } else if (onLeavePlayer) {
          await onLeavePlayer(player.id);
        }
        
        try {
          const myIds = JSON.parse(localStorage.getItem('my_added_players') || '[]');
          const updated = myIds.filter(id => id !== player.id);
          localStorage.setItem('my_added_players', JSON.stringify(updated));
        } catch {}

        showToast(`Đã xóa ${player.name}`);
      } catch {
        showToast('Lỗi khi xóa.');
      }
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
            const canRemove = isAdmin || isMyAdded;

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
                        {isMyAdded && !isAdmin && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--emerald)', marginLeft: '4px' }}>
                            (Bạn thêm)
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {isAdmin && (
                        <button 
                          onClick={() => startEdit(player)}
                          style={{ background: 'none', border: 'none', color: '#FFA502', cursor: 'pointer', padding: '2px' }}
                          title="Sửa tên"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}

                      {canRemove && (
                        <button 
                          onClick={() => handleDelete(player)}
                          style={{ background: 'none', border: 'none', color: '#FF6B81', cursor: 'pointer', padding: '2px' }}
                          title={isMyAdded ? 'Hủy người bạn vừa thêm' : 'Xóa cầu thủ'}
                        >
                          <Trash2 size={13} />
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
    </div>
  );
}
