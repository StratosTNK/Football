import React, { useState, useEffect, useRef } from 'react';
import { 
  Shirt, 
  RefreshCw, 
  Undo2, 
  Copy, 
  ChevronDown, 
  ArrowRightLeft, 
  Check, 
  SlidersHorizontal,
  Camera,
  Download,
  FileText,
  X,
  Loader2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { formatTeamsForZalo, formatDateDMY } from '../utils/zaloFormatter';
import { POSITIONS, RATINGS, calculateTeamStats } from '../utils/teamBalancer';
import Portal from './Portal';

export default function TeamDivider({ 
  match, 
  isAdmin, 
  onRandomSplit, 
  onResetTeams, 
  onUpdatePlayerTeam, 
  showToast 
}) {
  const { players = [], teamCount = 2 } = match;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTransferPlayerId, setActiveTransferPlayerId] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const menuRef = useRef(null);

  // Image Export States
  const [exportingImage, setExportingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [withHeader, setWithHeader] = useState(true);
  const [copiedImage, setCopiedImage] = useState(false);
  const exportCardRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const teamMetadata = [
    { id: 1, name: 'ĐỘI ĐỎ', color: '#FF4757', icon: '🔴' },
    { id: 2, name: 'ĐỘI XANH', color: '#1E90FF', icon: '🔵' },
    { id: 3, name: 'ĐỘI VÀNG', color: '#FFA502', icon: '🟡' }
  ];

  const handleCopyZalo = () => {
    const text = formatTeamsForZalo(match);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('📋 Đã copy kết quả chia đội gửi Zalo!');
    }
  };

  // Generate high-resolution PNG of the 2-team / 3-team card
  const generateImage = async () => {
    if (!exportCardRef.current) return null;
    try {
      setExportingImage(true);
      await new Promise(r => setTimeout(r, 80));
      const dataUrl = await toPng(exportCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#070C15',
        cacheBust: true
      });
      return dataUrl;
    } catch (err) {
      console.error('Lỗi tạo ảnh chia đội:', err);
      showToast('❌ Không thể tạo ảnh chia đội, vui lòng thử lại!');
      return null;
    } finally {
      setExportingImage(false);
    }
  };

  const handleCopyImageZalo = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    setImagePreviewUrl(dataUrl);
    setShowImageModal(true);

    // Try copying directly to clipboard for instant Ctrl+V into Zalo
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        showToast('📸 Đã sao chép ảnh chia đội! Bạn có thể Dán (Ctrl+V) vào Zalo ngay.');
        setTimeout(() => setCopiedImage(false), 3000);
      }
    } catch (clipErr) {
      console.log('Clipboard image write skipped:', clipErr);
      showToast('📸 Đã tạo ảnh chia đội! Bạn có thể Tải về hoặc Chạm giữ để gửi Zalo.');
    }
  };

  const handleDownloadImage = () => {
    if (!imagePreviewUrl) return;
    const link = document.createElement('a');
    link.download = `Ket-qua-chia-doi-${match.matchDate || 'bong-da'}.png`;
    link.href = imagePreviewUrl;
    link.click();
    showToast('📥 Đang tải ảnh chia đội về máy!');
  };

  const handleRecopyImage = async () => {
    if (!imagePreviewUrl) return;
    try {
      const res = await fetch(imagePreviewUrl);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        showToast('📸 Đã sao chép ảnh vào bộ nhớ tạm! Bạn có thể Ctrl+V vào Zalo.');
        setTimeout(() => setCopiedImage(false), 3000);
      } else {
        showToast('💡 Trình duyệt không hỗ trợ chép ảnh trực tiếp, vui lòng bấm Tải Về.');
      }
    } catch (err) {
      showToast('💡 Vui lòng bấm Tải Ảnh Về Máy để gửi Zalo.');
    }
  };

  // Re-render image when withHeader toggle changes
  useEffect(() => {
    if (showImageModal && exportCardRef.current) {
      generateImage().then(url => {
        if (url) setImagePreviewUrl(url);
      });
    }
  }, [withHeader]);

  const actualTeamCount = teamCount || 2;
  const activeTeams = teamMetadata.slice(0, actualTeamCount);
  const unassigned = players.filter(p => !p.team || p.team === 0);

  const renderTeamCard = (teamMeta) => {
    const teamPlayers = players.filter(p => p.team === teamMeta.id);

    return (
      <div 
        key={teamMeta.id} 
        style={{
          background: teamMeta.id === 1
            ? 'linear-gradient(180deg, rgba(255, 71, 87, 0.09) 0%, rgba(11, 19, 30, 0.9) 100%)'
            : teamMeta.id === 2
              ? 'linear-gradient(180deg, rgba(30, 144, 255, 0.09) 0%, rgba(11, 19, 30, 0.9) 100%)'
              : 'linear-gradient(180deg, rgba(255, 165, 2, 0.09) 0%, rgba(11, 19, 30, 0.9) 100%)',
          border: `1px solid ${teamMeta.color}38`,
          borderRadius: 'var(--radius-md)',
          boxShadow: `0 4px 18px -4px ${teamMeta.color}20`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Team Section Header Banner */}
        {(() => {
          const stats = calculateTeamStats(teamPlayers);
          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: teamMeta.id === 1 
                ? 'linear-gradient(90deg, rgba(255, 71, 87, 0.22), rgba(255, 71, 87, 0.05))' 
                : teamMeta.id === 2 
                  ? 'linear-gradient(90deg, rgba(30, 144, 255, 0.22), rgba(30, 144, 255, 0.05))' 
                  : 'linear-gradient(90deg, rgba(255, 165, 2, 0.22), rgba(255, 165, 2, 0.05))',
              borderLeft: `4px solid ${teamMeta.color}`,
              padding: '8px 12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{teamMeta.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff', letterSpacing: '0.02em' }}>
                    {teamMeta.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#FFD700',
                    fontWeight: 800,
                    background: 'rgba(255, 215, 0, 0.15)',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }} title="Tổng điểm sức mạnh của đội">
                    ⚡ {stats.totalScore}đ
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: teamMeta.color,
                    fontWeight: 800,
                    background: 'rgba(0, 0, 0, 0.45)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: `1px solid ${teamMeta.color}45`
                  }}>
                    {teamPlayers.length} Cầu thủ
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Players in Team */}
        <div className="team-players-grid">
          {teamPlayers.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '12px 6px',
              color: 'var(--text-dim)',
              fontSize: '0.78rem',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              Chưa có cầu thủ trong đội
            </div>
          ) : (
            teamPlayers.map((player, idx) => {
              const isTransferring = activeTransferPlayerId === player.id;

              return (
                <div 
                  key={player.id} 
                  className="team-player-pill"
                  onClick={() => setSelectedPlayer(player)}
                  style={{
                    gridColumn: isTransferring ? '1 / -1' : undefined,
                    background: isTransferring 
                      ? 'rgba(0, 242, 152, 0.1)' 
                      : 'rgba(8, 14, 23, 0.75)',
                    border: isTransferring 
                      ? '1px solid rgba(0, 242, 152, 0.45)' 
                      : `1px solid ${teamMeta.color}25`,
                    borderRadius: '8px',
                    padding: isTransferring ? '8px 10px' : '6px 8px',
                    minHeight: '38px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isTransferring 
                      ? '0 0 12px rgba(0, 242, 152, 0.15)' 
                      : '0 2px 6px rgba(0, 0, 0, 0.25)',
                    position: 'relative'
                  }}
                  title="Chạm để xem chi tiết vị trí & năng lực"
                >
                  {/* Player Name Row */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: 0,
                      flex: 1
                    }}>
                      {/* Jersey Number Badge */}
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: `${teamMeta.color}20`,
                        border: `1px solid ${teamMeta.color}45`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: teamMeta.color,
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>

                      {/* Player Name: Full width with single line & ellipsis */}
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        color: '#FFFFFF',
                        lineHeight: 1.3,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {player.name}
                      </span>
                    </div>

                    {/* Admin Transfer Button (Quick Toggle) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTransferPlayerId(isTransferring ? null : player.id);
                        }}
                        style={{
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: isTransferring ? 'var(--emerald)' : '#94A3B8',
                          background: isTransferring ? 'rgba(0, 242, 152, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          border: isTransferring ? '1px solid rgba(0, 242, 152, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer'
                        }}
                        title={isTransferring ? 'Đóng chuyển đội' : 'Đổi đội nhanh'}
                      >
                        <ArrowRightLeft size={11} />
                        <span>{isTransferring ? 'Đóng' : 'Đổi'}</span>
                      </button>
                    )}
                  </div>

                  {/* Collapsible Transfer Options */}
                  {isAdmin && isTransferring && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        flexWrap: 'wrap',
                        animation: 'fadeIn 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Chuyển <strong style={{ color: '#fff' }}>"{player.name}"</strong> sang:
                      </span>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {activeTeams
                          .filter(t => t.id !== teamMeta.id)
                          .map(targetT => (
                            <button
                              key={targetT.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdatePlayerTeam(player.id, targetT.id);
                                setActiveTransferPlayerId(null);
                              }}
                              style={{
                                background: targetT.id === 1 
                                  ? 'rgba(255, 71, 87, 0.22)' 
                                  : targetT.id === 2 
                                    ? 'rgba(30, 144, 255, 0.22)' 
                                    : 'rgba(255, 165, 2, 0.22)',
                                border: `1px solid ${targetT.color}`,
                                borderRadius: '5px',
                                padding: '4px 10px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'transform 0.1s ease'
                              }}
                            >
                              <span>➔</span>
                              <span>{targetT.icon}</span>
                              <span>{targetT.name}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="clean-card" style={{ padding: '14px', marginBottom: '16px' }}>
      {/* Card Header: Title on Left, Quick Actions on Right */}
      <div 
        className="team-divider-card-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px',
          position: 'relative'
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 auto' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(0, 242, 152, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald)',
            flexShrink: 0
          }}>
            <Shirt size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.25 }}>
              KẾT QUẢ PHÂN ĐỘI
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {actualTeamCount} Đội ({players.length} cầu thủ){isAdmin && ' • Chạm tên đổi đội'}
            </span>
          </div>
        </div>

        {/* Action Controls: Quick Xuất Ảnh + Dropdown Menu */}
        <div className="team-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} ref={menuRef}>
          {/* Quick Button to Export Image (Always accessible for 1-tap sharing!) */}
          <button
            type="button"
            onClick={handleCopyImageZalo}
            disabled={exportingImage}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'linear-gradient(135deg, rgba(0, 242, 152, 0.15), rgba(56, 189, 248, 0.15))',
              border: '1px solid rgba(0, 242, 152, 0.4)',
              color: 'var(--emerald)',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Xuất ảnh 2 đội gửi Zalo"
          >
            {exportingImage ? <Loader2 size={13} className="spin" /> : <Camera size={13} />}
            <span>{exportingImage ? 'Đang tạo...' : 'Xuất Ảnh'}</span>
          </button>

          {isAdmin && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.76rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: menuOpen ? 'rgba(0, 242, 152, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: menuOpen ? '1px solid var(--emerald)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: menuOpen ? 'var(--emerald)' : '#fff',
                  fontWeight: 700
                }}
                title="Tùy chọn thao tác chia đội"
              >
                <SlidersHorizontal size={13} />
                <span>Tùy Chọn</span>
                <ChevronDown size={13} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Dropdown Menu Popup */}
              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '240px',
                  background: 'rgba(11, 19, 30, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '10px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
                  zIndex: 100,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <div style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Bốc thăm phân đội:
                  </div>

                  {/* Option 1: 2 Đội */}
                  <button
                    type="button"
                    onClick={() => { onRandomSplit(2); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: actualTeamCount === 2 ? 'rgba(0, 242, 152, 0.12)' : 'transparent',
                      color: actualTeamCount === 2 ? 'var(--emerald)' : '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔴 vs 🔵</span>
                      <span>Chia 2 Đội (Đỏ vs Xanh)</span>
                    </div>
                    {actualTeamCount === 2 && <Check size={14} color="var(--emerald)" />}
                  </button>

                  {/* Option 2: 3 Đội */}
                  <button
                    type="button"
                    onClick={() => { onRandomSplit(3); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: actualTeamCount === 3 ? 'rgba(0, 242, 152, 0.12)' : 'transparent',
                      color: actualTeamCount === 3 ? 'var(--emerald)' : '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔴 vs 🔵 vs 🟡</span>
                      <span>Chia 3 Đội (Xoay vòng)</span>
                    </div>
                    {actualTeamCount === 3 && <Check size={14} color="var(--emerald)" />}
                  </button>

                  {/* Option 3: Xáo bài lại */}
                  <button
                    type="button"
                    onClick={() => { onRandomSplit(actualTeamCount); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--emerald)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>Xáo lại ngẫu nhiên ({actualTeamCount} Đội)</span>
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                  {/* Option 4: Copy Ảnh Zalo */}
                  <button
                    type="button"
                    onClick={() => { handleCopyImageZalo(); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(0, 242, 152, 0.08)',
                      color: 'var(--emerald)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Camera size={14} />
                    <span>Copy ảnh chia đội gửi Zalo</span>
                  </button>

                  {/* Option 5: Copy Chữ Zalo */}
                  <button
                    type="button"
                    onClick={() => { handleCopyZalo(); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#38BDF8',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <FileText size={14} />
                    <span>Copy dạng chữ (Text) gửi Zalo</span>
                  </button>

                  {/* Option 5: Hủy phân đội */}
                  <button
                    type="button"
                    onClick={() => { onResetTeams(); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#FF6B81',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Undo2 size={13} />
                    <span>Hủy phân đội (Về điểm danh)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TEAMS LIST (VS Arena - Side-by-side on PC, Stacked on Mobile) */}
      <div className={`teams-arena-container teams-count-${actualTeamCount}`}>
        {actualTeamCount === 2 ? (
          <>
            {/* Team 1: Đội Đỏ */}
            {renderTeamCard(activeTeams[0])}

            {/* Desktop VS Divider (Center Vertical Line & Glowing Badge) */}
            <div className="teams-vs-divider-desktop">
              <div style={{
                position: 'absolute',
                top: '20px',
                bottom: '20px',
                width: '1px',
                background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
              }} />
              <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #131E2E 0%, #0A111B 100%)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 14px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 242, 152, 0.2)',
                zIndex: 1
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #FF4757, #FFA502, #1E90FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.05em'
                }}>
                  VS
                </span>
              </div>
            </div>

            {/* Mobile VS Divider (Horizontal Line & Glowing Badge) */}
            <div className="teams-vs-divider-mobile">
              <div style={{
                position: 'absolute',
                left: '12px',
                right: '12px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent)'
              }} />
              <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #131E2E 0%, #0A111B 100%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '20px',
                padding: '2px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 242, 152, 0.15)',
                zIndex: 1
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  background: 'linear-gradient(90deg, #FF4757, #FFA502, #1E90FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  ⚡ VS ⚡
                </span>
              </div>
            </div>

            {/* Team 2: Đội Xanh */}
            {renderTeamCard(activeTeams[1])}
          </>
        ) : (
          /* 3 Teams */
          activeTeams.map((teamMeta, teamIdx) => (
            <React.Fragment key={teamMeta.id}>
              {teamIdx > 0 && (
                <div className="teams-vs-divider-mobile">
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    right: '12px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent)'
                  }} />
                  <div style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #131E2E 0%, #0A111B 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '20px',
                    padding: '2px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 242, 152, 0.15)',
                    zIndex: 1
                  }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      background: 'linear-gradient(90deg, #FF4757, #FFA502, #1E90FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ⚡ VS ⚡
                    </span>
                  </div>
                </div>
              )}
              {renderTeamCard(teamMeta)}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Unassigned players if any */}
      {unassigned.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
            ⚪ Dự Bị / Chưa Phân Đội ({unassigned.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {unassigned.map(p => (
              <span key={p.id} style={{ background: '#0B131E', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sleek Player Profile Modal (Vị trí & Trình độ thi đấu khi chạm vào tên cầu thủ) */}
      {selectedPlayer && (() => {
        const selectedPlayerTeam = teamMetadata.find(t => t.id === selectedPlayer.team) || { name: 'Chưa phân đội', color: '#00F298', icon: '⚽' };

        return (
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
                  marginBottom: '14px', 
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: `${selectedPlayerTeam.color}25`,
                      border: `1px solid ${selectedPlayerTeam.color}50`,
                      color: selectedPlayerTeam.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: `0 4px 14px ${selectedPlayerTeam.color}30`
                    }}>
                      {selectedPlayerTeam.icon || '⚽'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                          {selectedPlayer.name}
                        </h3>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          color: selectedPlayerTeam.color, 
                          background: `${selectedPlayerTeam.color}20`,
                          border: `1px solid ${selectedPlayerTeam.color}40`,
                          padding: '1px 7px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          {selectedPlayerTeam.name}
                        </span>
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
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '2px' }}>
                    Năng lực theo từng vị trí sở trường:
                  </div>
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
                          background: isHighlight ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                          border: isHighlight ? `1px solid ${pos.border}` : '1px solid rgba(255, 255, 255, 0.07)'
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

                {/* Admin Quick Team Transfer Inside Modal */}
                {isAdmin && onUpdatePlayerTeam && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                      🔄 Chuyển sang đội khác (Admin):
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {activeTeams
                        .filter(t => t.id !== selectedPlayer.team)
                        .map(targetT => (
                          <button
                            key={targetT.id}
                            type="button"
                            onClick={() => {
                              onUpdatePlayerTeam(selectedPlayer.id, targetT.id);
                              setSelectedPlayer(prev => prev ? ({ ...prev, team: targetT.id }) : null);
                              if (showToast) showToast(`Đã chuyển ${selectedPlayer.name} sang ${targetT.name}!`);
                            }}
                            style={{
                              flex: 1,
                              minWidth: '100px',
                              background: `${targetT.color}20`,
                              border: `1px solid ${targetT.color}60`,
                              borderRadius: '8px',
                              padding: '8px 10px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>➔</span>
                            <span>{targetT.icon}</span>
                            <span>{targetT.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </Portal>
        );
      })()}

      {/* Modal Preview & Tải Ảnh Chia Đội Gửi Zalo */}
      {showImageModal && (
        <Portal>
          <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()} 
              style={{ maxWidth: '660px', padding: '16px', textAlign: 'center', margin: 'auto' }}
            >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="var(--emerald)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Ảnh Kết Quả Chia Đội
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Toggle Header Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#fff', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={withHeader}
                  onChange={(e) => setWithHeader(e.target.checked)}
                  style={{ accentColor: 'var(--emerald)', cursor: 'pointer' }}
                />
                <span>Kèm tên trận & ngày giờ</span>
              </label>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                {withHeader ? 'Đầy đủ thông tin' : 'Chỉ 2 đội (như ảnh chụp)'}
              </span>
            </div>

            {/* Image Preview Canvas */}
            <div style={{
              background: '#04070D',
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '160px'
            }}>
              {exportingImage ? (
                <div style={{ padding: '30px', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Loader2 size={20} className="spin" />
                  <span>Đang dựng ảnh sắc nét...</span>
                </div>
              ) : imagePreviewUrl ? (
                <img 
                  src={imagePreviewUrl} 
                  alt="Ảnh kết quả chia đội" 
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
                    display: 'block'
                  }}
                />
              ) : null}
            </div>

            {/* Instruction Tip */}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
              💡 <strong>Mẹo Zalo:</strong> Trên PC chỉ cần bấm <strong>Ctrl+V</strong> vào ô chat. Trên điện thoại, bạn có thể <strong>Chạm giữ ảnh 1 giây</strong> để Lưu hoặc Gửi Zalo!
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadImage}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={15} />
                <span>Tải Ảnh Về Máy</span>
              </button>

              <button
                type="button"
                onClick={handleRecopyImage}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {copiedImage ? <Check size={15} color="var(--emerald)" /> : <Copy size={15} />}
                <span>{copiedImage ? 'Đã Sao Chép!' : 'Sao Chép Ảnh'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCopyZalo();
                  setShowImageModal(false);
                }}
                className="btn btn-secondary"
                style={{ padding: '10px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                title="Copy dạng văn bản text gửi Zalo"
              >
                <FileText size={15} />
                <span>Copy Chữ</span>
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Dedicated Off-Screen Render Node for High-Res PNG Capture (Matches Image 3 Exactly) */}
      <div style={{
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '800px',
        pointerEvents: 'none'
      }}>
        <div 
          ref={exportCardRef}
          style={{
            width: '800px',
            background: '#070C15',
            padding: withHeader ? '20px' : '16px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxSizing: 'border-box'
          }}
        >
          {/* Optional Top Match Info Header */}
          {withHeader && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              marginBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(0, 242, 152, 0.15)',
                  border: '1px solid rgba(0, 242, 152, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  ⚽
                </div>
                <div>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}>
                    {match.title || 'GIAO HỮU BÓNG ĐÁ'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#00F298', fontWeight: 600, marginTop: '2px' }}>
                    📅 {formatDateDMY(match.matchDate)} • ⏰ {match.matchTime || '19:30 - 20:30'} {match.stadium ? `• 📍 ${match.stadium}` : ''}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.75)',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.14)'
              }}>
                {actualTeamCount} Đội ({players.length} Cầu thủ)
              </div>
            </div>
          )}

          {/* The Arena Grid (Side-by-side with 1-column vertical player list, exactly as Image 3) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: actualTeamCount === 2 ? '1fr auto 1fr' : `repeat(${actualTeamCount}, 1fr)`,
            gap: '14px',
            alignItems: 'stretch'
          }}>
            {activeTeams.map((teamMeta, tIdx) => {
              const teamPlayers = players.filter(p => p.team === teamMeta.id);
              return (
                <React.Fragment key={teamMeta.id}>
                  {/* Center VS Divider between Team 1 and Team 2 */}
                  {actualTeamCount === 2 && tIdx === 1 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      width: '40px',
                      padding: '0 4px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        bottom: '15px',
                        width: '1px',
                        background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.25), transparent)'
                      }} />
                      <div style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, #131E2E 0%, #0A111B 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 242, 152, 0.25)',
                        zIndex: 2
                      }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          letterSpacing: '0.05em',
                          background: 'linear-gradient(135deg, #FF4757, #FFA502, #1E90FF)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          VS
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Team Card */}
                  <div style={{
                    background: teamMeta.id === 1
                      ? 'linear-gradient(180deg, rgba(255, 71, 87, 0.12) 0%, rgba(13, 21, 33, 0.96) 100%)'
                      : teamMeta.id === 2
                        ? 'linear-gradient(180deg, rgba(30, 144, 255, 0.12) 0%, rgba(13, 21, 33, 0.96) 100%)'
                        : 'linear-gradient(180deg, rgba(255, 165, 2, 0.12) 0%, rgba(13, 21, 33, 0.96) 100%)',
                    border: `1px solid ${teamMeta.color}45`,
                    borderRadius: '12px',
                    boxShadow: `0 4px 20px ${teamMeta.color}20`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Team Header Banner */}
                    {(() => {
                      const expStats = calculateTeamStats(teamPlayers);
                      return (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          background: teamMeta.id === 1 
                            ? 'linear-gradient(180deg, rgba(255, 71, 87, 0.22), rgba(255, 71, 87, 0.06))' 
                            : teamMeta.id === 2 
                              ? 'linear-gradient(180deg, rgba(30, 144, 255, 0.22), rgba(30, 144, 255, 0.06))' 
                              : 'linear-gradient(180deg, rgba(255, 165, 2, 0.22), rgba(255, 165, 2, 0.06))',
                          borderLeft: `4px solid ${teamMeta.color}`,
                          borderBottom: `1px solid ${teamMeta.color}30`,
                          padding: '10px 12px'
                        }}>
                          {/* Row 1: Team Name (Centered, prominent, single line) */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: teamMeta.color,
                              boxShadow: `0 0 10px ${teamMeta.color}`,
                              flexShrink: 0
                            }} />
                            <span style={{
                              fontWeight: 900,
                              fontSize: '0.96rem',
                              color: '#FFFFFF',
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              whiteSpace: 'nowrap'
                            }}>
                              {teamMeta.name}
                            </span>
                          </div>

                          {/* Row 2: Balanced Score & Player Count Chips */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: '#FFD700',
                              background: 'rgba(255, 215, 0, 0.16)',
                              border: '1px solid rgba(255, 215, 0, 0.35)',
                              padding: '2.5px 10px',
                              borderRadius: '999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              whiteSpace: 'nowrap'
                            }}>
                              ⚡ {expStats.totalScore}đ
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: teamMeta.color,
                              background: `${teamMeta.color}20`,
                              border: `1px solid ${teamMeta.color}45`,
                              padding: '2.5px 10px',
                              borderRadius: '999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              whiteSpace: 'nowrap'
                            }}>
                              ⚽ {teamPlayers.length} Cầu thủ
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Player rows (Vertical list: 1 item per row, cleanly displaying only number and name) */}
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {teamPlayers.map((player, idx) => (
                        <div
                          key={player.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.035)',
                            border: `1px solid ${teamMeta.color}25`,
                            borderRadius: '8px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: `${teamMeta.color}20`,
                            border: `1px solid ${teamMeta.color}45`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            color: teamMeta.color,
                            flexShrink: 0
                          }}>
                            {idx + 1}
                          </div>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            color: '#FFFFFF',
                            lineHeight: 1.3,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {player.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
