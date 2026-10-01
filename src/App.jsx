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
import { Shirt, ListChecks } from 'lucide-react';

export default function App() {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Active view toggle when balanced (Teams vs Attendance List)
  const [viewTab, setViewTab] = useState('teams'); // 'teams' | 'list'

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

  // Fetch initial match data
  const fetchMatch = async () => {
    try {
      const res = await fetch('/api/match');
      const data = await res.json();
      if (data.success) {
        setMatch(data.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu trận:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();

    // Listen to realtime socket updates
    socket.on('match_updated', (updatedData) => {
      setMatch(updatedData);
    });

    socket.on('celebrate_split', () => {
      triggerConfetti();
    });

    return () => {
      socket.off('match_updated');
      socket.off('celebrate_split');
    };
  }, []);

  // --- API Handlers ---

  // 1. Join Match (Public)
  const handleJoin = async (name) => {
    const res = await fetch('/api/player/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Không thể điểm danh!');
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

  // 9. Admin Edit Player Name
  const handleEditPlayer = async (playerId, name) => {
    return adminFetch('/api/admin/edit-player', { playerId, name });
  };

  // 10. Admin Delete Player
  const handleDeletePlayer = async (playerId) => {
    return adminFetch('/api/admin/delete-player', { playerId });
  };

  // 11. Admin Add Player Directly
  const handleAddPlayer = async (name, team) => {
    return adminFetch('/api/admin/add-player', { name, team });
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
        showToast={showToast}
      />

      {/* Match Info Card (Venue, Expected Time, Countdown, Progress) */}
      <MatchInfoCard 
        match={match}
        isAdmin={isAdmin}
        onEditClick={() => setShowAdminPanel(true)}
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
                style={{ flex: 1, padding: '10px', fontSize: '0.95rem' }}
              >
                <Shirt size={18} /> Đội Hình Thi Đấu
              </button>
              <button
                onClick={() => setViewTab('list')}
                className={viewTab === 'list' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '10px', fontSize: '0.95rem' }}
              >
                <ListChecks size={18} /> Danh Sách Điểm Danh ({match.players.length})
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
                  onEditPlayer={handleEditPlayer}
                  onDeletePlayer={handleDeletePlayer}
                  onLeavePlayer={handleLeave}
                  onRandomSplit={handleRandomSplit}
                  showToast={showToast}
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
              onEditPlayer={handleEditPlayer}
              onDeletePlayer={handleDeletePlayer}
              onLeavePlayer={handleLeave}
              onRandomSplit={handleRandomSplit}
              showToast={showToast}
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

        <AdminPanel 
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          match={match}
          onUpdateMatch={handleUpdateMatch}
          onRandomSplit={handleRandomSplit}
          onResetTeams={handleResetTeams}
          onAddPlayer={handleAddPlayer}
          onClearPlayers={handleClearPlayers}
          onChangePassword={handleChangePassword}
          showToast={showToast}
        />

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
