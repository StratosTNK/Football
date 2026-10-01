import React from 'react';
import { Shirt, RefreshCw, Undo2, Copy } from 'lucide-react';
import { formatMatchForZalo } from '../utils/zaloFormatter';

export default function TeamDivider({ 
  match, 
  isAdmin, 
  onRandomSplit, 
  onResetTeams, 
  onUpdatePlayerTeam, 
  showToast 
}) {
  const { players = [], teamCount = 2 } = match;

  const teamMetadata = [
    { id: 1, name: 'ĐỘI ĐỎ', color: '#FF4757', boxClass: 'team-box-red', icon: '🔴' },
    { id: 2, name: 'ĐỘI XANH', color: '#1E90FF', boxClass: 'team-box-blue', icon: '🔵' },
    { id: 3, name: 'ĐỘI VÀNG', color: '#FFA502', boxClass: 'team-box-yellow', icon: '🟡' }
  ];

  const handleCopyZalo = () => {
    const text = formatMatchForZalo(match);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('📋 Đã sao chép danh sách chia đội Zalo!');
    }
  };

  const activeTeams = teamMetadata.slice(0, teamCount);
  const unassigned = players.filter(p => !p.team || p.team === 0);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Action Bar */}
      <div className="clean-card" style={{ padding: '10px 14px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shirt size={18} color="var(--emerald)" />
            <strong style={{ fontSize: '0.98rem', color: '#fff' }}>KẾT QUẢ PHÂN ĐỘI</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({teamCount} Đội)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={handleCopyZalo} 
              className="btn btn-zalo"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              <Copy size={14} /> Copy Zalo
            </button>

            {isAdmin && (
              <>
                <button 
                  onClick={() => onRandomSplit(teamCount)}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  title="Xáo bài và chia lại"
                >
                  <RefreshCw size={14} /> Chia Lại
                </button>
                <button 
                  onClick={onResetTeams}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', color: '#FF6B81' }}
                  title="Hủy chia đội"
                >
                  <Undo2 size={14} /> Hủy
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="teams-grid">
        {activeTeams.map((teamMeta) => {
          const teamPlayers = players.filter(p => p.team === teamMeta.id);

          return (
            <div key={teamMeta.id} className={`team-box ${teamMeta.boxClass}`}>
              {/* Team header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                  {teamMeta.icon} {teamMeta.name}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {teamPlayers.length} Cầu thủ
                </span>
              </div>

              {/* Player rows */}
              {teamPlayers.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  Chưa có cầu thủ
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {teamPlayers.map((player, idx) => (
                    <div 
                      key={player.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#0B131E',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.88rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{player.name}</span>
                      </div>

                      {/* Admin transfer button */}
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {activeTeams
                            .filter(t => t.id !== teamMeta.id)
                            .map(targetT => (
                              <button
                                key={targetT.id}
                                onClick={() => onUpdatePlayerTeam(player.id, targetT.id)}
                                style={{
                                  background: 'rgba(255,255,255,0.08)',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '2px 5px',
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  color: '#fff'
                                }}
                                title={`Chuyển sang ${targetT.name}`}
                              >
                                ➔ {targetT.icon}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned players if any */}
      {unassigned.length > 0 && (
        <div className="clean-card" style={{ marginTop: '10px', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
            ⚪ Dự Bị / Chưa Phân Đội ({unassigned.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {unassigned.map(p => (
              <span key={p.id} style={{ background: '#0B131E', padding: '3px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
