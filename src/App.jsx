import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import socket from './utils/socket';
import Header from './components/Header';
import MatchInfoCard from './components/MatchInfoCard';
import PlayerRegistration from './components/PlayerRegistration';
import PlayerList from './components/PlayerList';
import TeamDivider from './components/TeamDivider';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import ChampionsLeagueAudioPlayer from './components/ChampionsLeagueAudioPlayer';
import PitchFinderModal from './components/PitchFinderModal';
import Portal from './components/Portal';
import { Shirt, ListChecks, Shuffle, RefreshCw, Undo2 } from 'lucide-react';

export default function App() {
  const [match, setMatch] = useState(() => {
    try {
      const cached = localStorage.getItem('dsu_cached_match');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      title: "Giao hữu giữa Thể Thao - Thanh Khê",
      stadium: "Sân ĐH TDTT Đà Nẵng",
      location: "44 Dũng Sĩ Thanh Khê, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng",
      matchDate: "2026-10-03",
      matchTime: "20:00 - 21:00",
      maxPlayers: 14,
      teamCount: 2,
      status: "OPEN",
      players: [],
      hasPasswordSet: true
    };
  });
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Music state: ON by default!
  const [musicPlaying, setMusicPlaying] = useState(true);
  const audioRef = useRef(null);

  const handleToggleMusic = () => {
    if (audioRef.current) {
      audioRef.current.toggle();
    }
  };

  // Admin authentication state
  const [adminToken, setAdminToken] = useState(localStorage.getItem('football_admin_token') || '');
  const isAdmin = Boolean(adminToken);

  // Track players added on this device reactively
  const [myAddedIds, setMyAddedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('my_added_players') || '[]');
    } catch {
      return [];
    }
  });

  const recordAddedPlayerId = (id) => {
    if (!id) return;
    setMyAddedIds((prev) => {
      const updated = prev.includes(id) ? prev : [...prev, id];
      try {
        localStorage.setItem('my_added_players', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeAddedPlayerId = (id) => {
    if (!id) return;
    setMyAddedIds((prev) => {
      const updated = prev.filter((item) => item !== id);
      try {
        localStorage.setItem('my_added_players', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Active view toggle when balanced (Teams vs Attendance List)
  const [viewTab, setViewTab] = useState('teams'); // 'teams' | 'list'
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showPitchFinder, setShowPitchFinder] = useState(false);
  const [splitCardOpen, setSplitCardOpen] = useState(false);

  const handleToggleSplit = () => {
    setShowSplitModal(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Trigger celebration confetti and UEFA anthem
  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
    if (window.playChampionsLeagueAnthem) {
      window.playChampionsLeagueAnthem();
    }
  };

  const prevStatusRef = useRef(null);
  const showAdminPanelRef = useRef(showAdminPanel);
  useEffect(() => {
    showAdminPanelRef.current = showAdminPanel;
  }, [showAdminPanel]);

  // Fetch match data
  const fetchMatch = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/match?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) {
        if (!silent) setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setMatch(data.data);
        try {
          localStorage.setItem('dsu_cached_match', JSON.stringify(data.data));
        } catch {}
      }
    } catch (err) {
      if (!silent) {
        console.error('Lỗi tải dữ liệu trận:', err);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMatch();

    // Auto sync every 3 seconds for all players on different devices
    // Pauses while AdminPanel is open to prevent background sync from interfering with editing
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !showAdminPanelRef.current) {
        fetchMatch(true);
      }
    }, 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !showAdminPanelRef.current) {
        fetchMatch(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen to realtime socket updates if running local socket server
    socket.on('match_updated', (updatedData) => {
      setMatch(updatedData);
    });

    socket.on('celebrate_split', () => {
      triggerConfetti();
    });

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.off('match_updated');
      socket.off('celebrate_split');
    };
  }, []);

  // When match status changes to BALANCED from OPEN, celebrate with confetti
  useEffect(() => {
    if (match) {
      if (prevStatusRef.current === 'OPEN' && match.status === 'BALANCED') {
        triggerConfetti();
      }
      prevStatusRef.current = match.status;
    }
  }, [match?.status]);

  // --- API Handlers ---

  // 1. Join Match (Public)
  const handleJoin = async (payload) => {
    const body = typeof payload === 'string' ? { name: payload } : payload;
    const res = await fetch('/api/player/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Không thể điểm danh!');
    }
    if (data.player?.id) {
      recordAddedPlayerId(data.player.id);
    }
    if (data.data) {
      setMatch(data.data);
      try {
        localStorage.setItem('dsu_cached_match', JSON.stringify(data.data));
      } catch {}
    }
    return data;
  };

  // 2. Leave Match (Public)
  const handleLeave = async (playerId) => {
    const res = await fetch('/api/player/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Không thể hủy điểm danh!');
    }
    removeAddedPlayerId(playerId);
    if (data.data) {
      setMatch(data.data);
      try {
        localStorage.setItem('dsu_cached_match', JSON.stringify(data.data));
      } catch {}
    }
    return data;
  };

  // 3. Admin Login
  const handleAdminLogin = async (password) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setAdminToken(data.token);
      localStorage.setItem('football_admin_token', data.token);
      return data;
    }
    return data;
  };

  // 4. Admin Logout
  const handleAdminLogout = () => {
    setAdminToken('');
    localStorage.removeItem('football_admin_token');
    showToast('Đã đăng xuất khỏi quyền Quản trị viên.');
  };

  // Admin Authorized Request Helper
  const adminFetch = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.status === 401 || res.status === 403) {
      handleAdminLogout();
      throw new Error('Hết phiên quản trị hoặc mật khẩu không đúng!');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Lỗi xử lý yêu cầu.');
    }
    if (data.data) {
      setMatch(data.data);
      try {
        localStorage.setItem('dsu_cached_match', JSON.stringify(data.data));
      } catch {}
    }
    return data;
  };

  // 5. Admin Update Match
  const handleUpdateMatch = async (matchPayload) => {
    return adminFetch('/api/admin/update-match', matchPayload);
  };

  // 6. Admin Random Split
  const handleRandomSplit = async (teamCount) => {
    const data = await adminFetch('/api/admin/random-split', { teamCount });
    triggerConfetti();
    return data;
  };

  // 7. Admin Reset Teams
  const handleResetTeams = async () => {
    return adminFetch('/api/admin/reset-teams', {});
  };

  // 8. Admin Update Player Team (Manual Adjust)
  const handleUpdatePlayerTeam = async (playerId, team) => {
    return adminFetch('/api/admin/update-player-team', { playerId, team });
  };

  // 9. Admin Edit Player (Name, Position, Rating)
  const handleEditPlayer = async (playerId, updateData) => {
    const payload = typeof updateData === 'string' ? { playerId, name: updateData } : { playerId, ...updateData };
    return adminFetch('/api/admin/edit-player', payload);
  };

  // 10. Admin Delete Player
  const handleDeletePlayer = async (playerId) => {
    removeAddedPlayerId(playerId);
    return adminFetch('/api/admin/delete-player', { playerId });
  };

  // 11. Admin Add Player Directly
  const handleAddPlayer = async (playerPayload, team = 0) => {
    const payload = typeof playerPayload === 'string' ? { name: playerPayload, team } : { team, ...playerPayload };
    return adminFetch('/api/admin/add-player', payload);
  };

  // 12. Admin Clear All Players (New Match)
  const handleClearPlayers = async () => {
    return adminFetch('/api/admin/clear-players', {});
  };

  // 13. Admin Change Password
  const handleChangePassword = async (newPassword) => {
    return adminFetch('/api/admin/change-password', { newPassword });
  };

  if (loading || !match) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--emerald-primary)'
      }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1.5s infinite linear' }}>⚽</div>
        <p style={{ marginTop: '16px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          Đang tải dữ liệu trận đá bóng...
        </p>
      </div>
    );
  }

  const isBalanced = match.status === 'BALANCED';

  return (
    <div className="container">
      {/* Header */}
      <Header 
        match={match}
        status={match.status}
        isAdmin={isAdmin}
        musicPlaying={musicPlaying}
        onToggleMusic={handleToggleMusic}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleAdminLogout}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
        onToggleSplit={handleToggleSplit}
        onOpenPitchFinder={() => setShowPitchFinder(true)}
        showToast={showToast}
      />

      {/* Match Info Card (Venue, Expected Time, Countdown, Progress) */}
      <MatchInfoCard 
        match={match}
        isAdmin={isAdmin}
        onEditClick={() => setShowAdminPanel(true)}
        onOpenPitchFinder={() => setShowPitchFinder(true)}
      />

        {/* If match is already balanced, show tabs: Kết Quả Đội vs Danh Sách */}
        {isBalanced ? (
          <div>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setViewTab('teams')}
                className={viewTab === 'teams' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '10px 6px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
              >
                <Shirt size={16} /> Đội Hình ({match.teamCount || 2} Đội)
              </button>
              <button
                onClick={() => setViewTab('list')}
                className={viewTab === 'list' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '10px 6px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
              >
                <ListChecks size={16} /> Điểm Danh ({match.players.length})
              </button>
            </div>

            {viewTab === 'teams' ? (
              <TeamDivider 
                match={match}
                isAdmin={isAdmin}
                onRandomSplit={handleRandomSplit}
                onResetTeams={handleResetTeams}
                onUpdatePlayerTeam={handleUpdatePlayerTeam}
                showToast={showToast}
              />
            ) : (
              <div>
                <PlayerRegistration 
                  status={match.status}
                  onJoin={handleJoin}
                  showToast={showToast}
                />
                <PlayerList 
                  match={match}
                  isAdmin={isAdmin}
                  myAddedIds={myAddedIds}
                  onEditPlayer={handleEditPlayer}
                  onDeletePlayer={handleDeletePlayer}
                  onLeavePlayer={handleLeave}
                  onRandomSplit={handleRandomSplit}
                  showToast={showToast}
                  externalSplitOpen={splitCardOpen}
                  setExternalSplitOpen={setSplitCardOpen}
                />
              </div>
            )}
          </div>
        ) : (
          /* Normal Attendance phase */
          <div>
            <PlayerRegistration 
              status={match.status}
              onJoin={handleJoin}
              showToast={showToast}
            />

            <PlayerList 
              match={match}
              isAdmin={isAdmin}
              myAddedIds={myAddedIds}
              onEditPlayer={handleEditPlayer}
              onDeletePlayer={handleDeletePlayer}
              onLeavePlayer={handleLeave}
              onRandomSplit={handleRandomSplit}
              showToast={showToast}
              externalSplitOpen={splitCardOpen}
              setExternalSplitOpen={setSplitCardOpen}
            />
          </div>
        )}

        {/* Modals */}
        <AdminLoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleAdminLogin}
          showToast={showToast}
        />

        {/* Quick Split Modal triggered from Header Chia Đội button */}
        {showSplitModal && (
          <Portal>
            <div className="modal-overlay" onClick={() => setShowSplitModal(false)}>
              <div 
                className="modal-content" 
                onClick={(e) => e.stopPropagation()} 
                style={{ maxWidth: '360px', textAlign: 'center', margin: 'auto' }}
              >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 152, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                color: 'var(--emerald)'
              }}>
                <Shuffle size={22} />
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                Bốc Thăm Chia Đội
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {match.players?.length >= 2 ? (
                  <span>Danh sách hiện có <strong>{match.players.length}</strong> cầu thủ</span>
                ) : (
                  <span style={{ color: '#FFA502' }}>Cần ít nhất 2 cầu thủ để chia đội</span>
                )}
              </p>

              <div style={{
                fontSize: '0.72rem',
                color: '#38BDF8',
                background: 'rgba(56, 189, 248, 0.09)',
                border: '1px solid rgba(56, 189, 248, 0.22)',
                padding: '6px 10px',
                borderRadius: '6px',
                marginBottom: '14px',
                textAlign: 'center'
              }}>
                ⚖️ Tự động cân bằng trình độ (S/A/B) và vị trí (GK/DF/MF/FW)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Option 1: 2 Đội */}
                <button
                  type="button"
                  disabled={match.players?.length < 2}
                  onClick={async () => {
                    await handleRandomSplit(2);
                    setViewTab('teams');
                    setShowSplitModal(false);
                    showToast('⚖️ Đã phân chia 2 Đội cân bằng theo trình độ và vị trí!');
                  }}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.25), rgba(30, 144, 255, 0.25))',
                    border: '1px solid rgba(0, 242, 152, 0.4)',
                    color: '#fff',
                    fontWeight: 700,
                    padding: '11px',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: match.players?.length < 2 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>🔴 vs 🔵</span>
                  <span>Chia 2 Đội Cân Bằng (Đỏ vs Xanh)</span>
                </button>

                {/* Option 2: 3 Đội */}
                <button
                  type="button"
                  disabled={match.players?.length < 3}
                  onClick={async () => {
                    await handleRandomSplit(3);
                    setViewTab('teams');
                    setShowSplitModal(false);
                    showToast('⚖️ Đã phân chia 3 Đội cân bằng theo trình độ và vị trí!');
                  }}
                  className="btn btn-secondary"
                  style={{
                    fontWeight: 700,
                    padding: '11px',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: match.players?.length < 3 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>🔴 vs 🔵 vs 🟡</span>
                  <span>Chia 3 Đội Cân Bằng (Xoay vòng)</span>
                </button>

                {/* If already balanced: Show Xáo lại & Hủy phân đội */}
                {isBalanced && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await handleRandomSplit(match.teamCount || 2);
                        setViewTab('teams');
                        setShowSplitModal(false);
                        showToast(`🔄 Đã xáo lại ngẫu nhiên ${match.teamCount || 2} Đội!`);
                      }}
                      className="btn btn-secondary"
                      style={{
                        color: 'var(--emerald)',
                        fontWeight: 700,
                        padding: '10px',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Xáo lại ngẫu nhiên ({match.teamCount || 2} Đội)</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await handleResetTeams();
                        setViewTab('list');
                        setShowSplitModal(false);
                        showToast('↩️ Đã hủy phân đội, trở về điểm danh.');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#FF6B81',
                        fontWeight: 600,
                        padding: '8px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Undo2 size={13} />
                      <span>Hủy phân đội (Về điểm danh)</span>
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowSplitModal(false)}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '12px', padding: '9px', fontSize: '0.84rem' }}
              >
                Đóng
              </button>
            </div>
          </div>
          </Portal>
        )}

        <AdminPanel 
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          match={match}
          onUpdateMatch={handleUpdateMatch}
          onClearPlayers={handleClearPlayers}
          onChangePassword={handleChangePassword}
          onOpenPitchFinder={() => setShowPitchFinder(true)}
          showToast={showToast}
        />

        {/* Modal Tìm Sân Bóng Đà Nẵng Gần ĐH TDTT */}
        {showPitchFinder && (
          <PitchFinderModal 
            match={match}
            isAdmin={isAdmin}
            onSelectStadium={async (stadiumPayload) => {
              if (isAdmin) {
                await handleUpdateMatch(stadiumPayload);
              }
            }}
            onClose={() => setShowPitchFinder(false)}
            showToast={showToast}
          />
        )}

        {/* Background UEFA Champions League Music Player */}
        <ChampionsLeagueAudioPlayer 
          ref={audioRef}
          showToast={showToast} 
          onStateChange={setMusicPlaying}
        />

        {/* Toast feedback notification */}
        {toastMessage && (
          <div className="toast-notice">
            <span>⚽</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
  );
}
