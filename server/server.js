import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadMatchData, saveMatchData } from './storage.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory state synchronized with JSON file
let matchState = loadMatchData();

// Helper to sanitize data sent to normal viewers (hide actual admin password)
const getPublicState = () => {
  const { adminPassword, ...publicData } = matchState;
  return {
    ...publicData,
    hasPasswordSet: Boolean(adminPassword)
  };
};

// Admin authentication middleware / helper
const verifyAdmin = (req) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  // We accept the current password as token or session token
  return token === matchState.adminPassword;
};

// --- PUBLIC ROUTES ---

// 1. Get current match info & players
app.get('/api/match', (req, res) => {
  res.json({ success: true, data: getPublicState() });
});

// 2. Player joins the match
app.post('/api/player/join', (req, res) => {
  const { name, note } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên của bạn!' });
  }

  const cleanName = name.trim();
  
  // Check if player already registered with this exact name
  const exists = matchState.players.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'Tên này đã có trong danh sách! Bạn có thể thêm số hoặc họ để phân biệt.' });
  }

  // Check max players if locked
  if (matchState.status === 'LOCKED') {
    return res.status(400).json({ success: false, message: 'Danh sách đã bị khóa bởi quản trị viên!' });
  }

  const newPlayer = {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: cleanName,
    team: 0, // 0 means unassigned
    createdAt: new Date().toISOString()
  };

  matchState.players.push(newPlayer);
  saveMatchData(matchState);

  // Broadcast update to all clients
  io.emit('match_updated', getPublicState());
  res.json({ success: true, player: newPlayer });
});

// 3. Player cancels their registration
app.post('/api/player/leave', (req, res) => {
  const { playerId } = req.body;
  if (!playerId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin cầu thủ!' });
  }

  const initialCount = matchState.players.length;
  matchState.players = matchState.players.filter(p => p.id !== playerId);

  if (matchState.players.length !== initialCount) {
    saveMatchData(matchState);
    io.emit('match_updated', getPublicState());
    return res.json({ success: true, message: 'Đã hủy đăng ký thành công.' });
  }

  res.status(404).json({ success: false, message: 'Không tìm thấy cầu thủ.' });
});

// --- ADMIN ROUTES ---

// 1. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === matchState.adminPassword) {
    return res.json({ success: true, token: matchState.adminPassword });
  }
  res.status(401).json({ success: false, message: 'Mật khẩu quản trị viên không chính xác!' });
});

// 2. Setup match details (time, venue, limit, status, notes)
app.post('/api/admin/update-match', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { title, stadium, location, matchDate, matchTime, maxPlayers, notes, status, teamCount } = req.body;

  if (title !== undefined) matchState.title = title;
  if (stadium !== undefined) matchState.stadium = stadium;
  if (location !== undefined) matchState.location = location;
  if (matchDate !== undefined) matchState.matchDate = matchDate;
  if (matchTime !== undefined) matchState.matchTime = matchTime;
  if (maxPlayers !== undefined) matchState.maxPlayers = Number(maxPlayers);
  if (notes !== undefined) matchState.notes = notes;
  if (status !== undefined) matchState.status = status;
  if (teamCount !== undefined) matchState.teamCount = Number(teamCount);

  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, data: getPublicState() });
});

// 3. Random Split Teams
app.post('/api/admin/random-split', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const teamCount = Number(req.body.teamCount) || matchState.teamCount || 2;
  matchState.teamCount = teamCount;

  if (matchState.players.length < 2) {
    return res.status(400).json({ success: false, message: 'Cần ít nhất 2 cầu thủ để chia đội!' });
  }

  // Fisher-Yates shuffle algorithm for fair randomness
  const shuffled = [...matchState.players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Assign teams evenly (1, 2, ..., teamCount)
  shuffled.forEach((player, idx) => {
    player.team = (idx % teamCount) + 1;
  });

  matchState.players = shuffled;
  matchState.status = 'BALANCED';

  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());
  io.emit('celebrate_split', { teamCount });

  res.json({ success: true, data: getPublicState() });
});

// 4. Update specific player's team (Edit Team)
app.post('/api/admin/update-player-team', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { playerId, team } = req.body;
  const player = matchState.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy cầu thủ!' });
  }

  player.team = Number(team);
  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, data: getPublicState() });
});

// 5. Swap two players between teams
app.post('/api/admin/swap-players', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { player1Id, player2Id } = req.body;
  const p1 = matchState.players.find(p => p.id === player1Id);
  const p2 = matchState.players.find(p => p.id === player2Id);

  if (!p1 || !p2) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy 1 trong 2 cầu thủ!' });
  }

  const tempTeam = p1.team;
  p1.team = p2.team;
  p2.team = tempTeam;

  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, data: getPublicState() });
});

// 6. Edit Player Name
app.post('/api/admin/edit-player', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { playerId, name } = req.body;
  const player = matchState.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy cầu thủ!' });
  }

  if (name && name.trim()) {
    player.name = name.trim();
  }

  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, data: getPublicState() });
});

// 7. Admin Delete Player
app.post('/api/admin/delete-player', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { playerId } = req.body;
  matchState.players = matchState.players.filter(p => p.id !== playerId);

  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, data: getPublicState() });
});

// 8. Admin Add Player Directly
app.post('/api/admin/add-player', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { name, team } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên!' });
  }

  const newPlayer = {
    id: 'p_admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    team: Number(team) || 0,
    createdAt: new Date().toISOString()
  };

  matchState.players.push(newPlayer);
  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, player: newPlayer });
});

// 9. Reset Teams only (Back to unassigned, keeps players)
app.post('/api/admin/reset-teams', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState.players.forEach(p => {
    p.team = 0;
  });
  matchState.status = 'OPEN';

  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, data: getPublicState() });
});

// 10. Clear All Players (New match preparation)
app.post('/api/admin/clear-players', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState.players = [];
  matchState.status = 'OPEN';

  saveMatchData(matchState);
  io.emit('match_updated', getPublicState());

  res.json({ success: true, data: getPublicState() });
});

// 11. Change Admin Password
app.post('/api/admin/change-password', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 4 ký tự!' });
  }

  matchState.adminPassword = newPassword.trim();
  saveMatchData(matchState);

  res.json({ success: true, message: 'Đổi mật khẩu Admin thành công!' });
});

// Socket.io Realtime connection
io.on('connection', (socket) => {
  // Send current state to newly connected client
  socket.emit('match_updated', getPublicState());

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// Serve compiled frontend files if dist exists (Fullstack single port deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`⚽ Football Server is running on http://localhost:${PORT}`);
});
