import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const TMP_FILE = '/tmp/match.json';

const getDefaultMatchState = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  return {
    title: "Giao hữu giữa Thể Thao - Thanh Khê",
    stadium: "Sân ĐH TDTT Đà Nẵng",
    location: "44 Dũng Sĩ Thanh Khê, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng",
    matchDate: dateStr,
    matchTime: "20:00 - 21:00",
    maxPlayers: 14,
    teamCount: 2,
    status: "OPEN",
    notes: "Mang giày đinh dăm TF. Đến sớm 10 phút khởi động!",
    adminPassword: "admin123",
    players: [],
    lastUpdated: new Date().toISOString()
  };
};

const loadState = () => {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading /tmp/match.json:', err);
  }

  // Try reading bundled server data
  try {
    const bundled = path.join(process.cwd(), 'server', 'data', 'match.json');
    if (fs.existsSync(bundled)) {
      const raw = fs.readFileSync(bundled, 'utf-8');
      const data = JSON.parse(raw);
      saveState(data);
      return data;
    }
  } catch (err) {
    console.error('Failed reading bundled match.json:', err);
  }

  const def = getDefaultMatchState();
  saveState(def);
  return def;
};

const saveState = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed writing /tmp/match.json:', err);
  }
};

let matchState = loadState();

const getPublicState = () => {
  matchState = loadState();
  const { adminPassword, ...publicData } = matchState;
  return {
    ...publicData,
    hasPasswordSet: Boolean(adminPassword)
  };
};

const verifyAdmin = (req) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  matchState = loadState();
  return token === matchState.adminPassword;
};

// 1. GET /api/match
app.get('/api/match', (req, res) => {
  res.json({ success: true, data: getPublicState() });
});

// Fallback for root /api
app.get('/api', (req, res) => {
  res.json({ success: true, data: getPublicState() });
});

// 2. POST /api/player/join
app.post('/api/player/join', (req, res) => {
  const { name, note } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên của bạn!' });
  }

  matchState = loadState();
  const cleanName = name.trim();
  const exists = matchState.players.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'Tên này đã có trong danh sách! Bạn có thể thêm số hoặc họ để phân biệt.' });
  }

  if (matchState.status === 'LOCKED') {
    return res.status(400).json({ success: false, message: 'Danh sách đã bị khóa bởi quản trị viên!' });
  }

  const newPlayer = {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: cleanName,
    note: note ? note.trim() : '',
    team: 0,
    createdAt: new Date().toISOString()
  };

  matchState.players.push(newPlayer);
  saveState(matchState);

  res.json({ success: true, player: newPlayer });
});

// 3. POST /api/player/leave
app.post('/api/player/leave', (req, res) => {
  const { playerId } = req.body;
  if (!playerId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin cầu thủ!' });
  }

  matchState = loadState();
  const initialCount = matchState.players.length;
  matchState.players = matchState.players.filter(p => p.id !== playerId);

  if (matchState.players.length !== initialCount) {
    saveState(matchState);
    return res.json({ success: true, message: 'Đã hủy đăng ký thành công.', data: getPublicState() });
  }

  res.status(404).json({ success: false, message: 'Không tìm thấy cầu thủ.' });
});

// 4. POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  matchState = loadState();
  if (password === matchState.adminPassword) {
    return res.json({ success: true, token: matchState.adminPassword });
  }
  res.status(401).json({ success: false, message: 'Mật khẩu quản trị viên không chính xác!' });
});

// 5. POST /api/admin/update-match
app.post('/api/admin/update-match', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { title, stadium, location, matchDate, matchTime, maxPlayers, notes, status, teamCount } = req.body;

  matchState = loadState();
  if (title !== undefined) matchState.title = title;
  if (stadium !== undefined) matchState.stadium = stadium;
  if (location !== undefined) matchState.location = location;
  if (matchDate !== undefined) matchState.matchDate = matchDate;
  if (matchTime !== undefined) matchState.matchTime = matchTime;
  if (maxPlayers !== undefined) matchState.maxPlayers = Number(maxPlayers);
  if (notes !== undefined) matchState.notes = notes;
  if (status !== undefined) matchState.status = status;
  if (teamCount !== undefined) matchState.teamCount = Number(teamCount);

  saveState(matchState);
  res.json({ success: true, data: getPublicState() });
});

// 6. POST /api/admin/random-split
app.post('/api/admin/random-split', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState = loadState();
  const teamCount = Number(req.body.teamCount) || matchState.teamCount || 2;
  matchState.teamCount = teamCount;

  if (matchState.players.length < 2) {
    return res.status(400).json({ success: false, message: 'Cần ít nhất 2 cầu thủ để chia đội!' });
  }

  const shuffled = [...matchState.players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  shuffled.forEach((player, idx) => {
    player.team = (idx % teamCount) + 1;
  });

  matchState.players = shuffled;
  matchState.status = 'BALANCED';

  saveState(matchState);
  res.json({ success: true, data: getPublicState() });
});

// 7. POST /api/admin/reset-teams
app.post('/api/admin/reset-teams', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState = loadState();
  matchState.players.forEach(p => {
    p.team = 0;
  });
  matchState.status = 'OPEN';

  saveState(matchState);
  res.json({ success: true, data: getPublicState() });
});

// 8. POST /api/admin/update-player-team
app.post('/api/admin/update-player-team', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState = loadState();
  const { playerId, team } = req.body;
  const player = matchState.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy cầu thủ!' });
  }

  player.team = Number(team);
  saveState(matchState);
  res.json({ success: true, data: getPublicState() });
});

// 9. POST /api/admin/edit-player
app.post('/api/admin/edit-player', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState = loadState();
  const { playerId, name } = req.body;
  const player = matchState.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy cầu thủ!' });
  }

  if (name && name.trim()) {
    player.name = name.trim();
  }

  saveState(matchState);
  res.json({ success: true, data: getPublicState() });
});

// 10. POST /api/admin/delete-player
app.post('/api/admin/delete-player', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState = loadState();
  const { playerId } = req.body;
  matchState.players = matchState.players.filter(p => p.id !== playerId);

  saveState(matchState);
  res.json({ success: true, data: getPublicState() });
});

// 11. POST /api/admin/add-player
app.post('/api/admin/add-player', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { name, team } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên!' });
  }

  matchState = loadState();
  const newPlayer = {
    id: 'p_admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    team: Number(team) || 0,
    createdAt: new Date().toISOString()
  };

  matchState.players.push(newPlayer);
  saveState(matchState);

  res.json({ success: true, player: newPlayer });
});

// 12. POST /api/admin/clear-players
app.post('/api/admin/clear-players', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  matchState = loadState();
  matchState.players = [];
  matchState.status = 'OPEN';

  saveState(matchState);
  res.json({ success: true, data: getPublicState() });
});

// 13. POST /api/admin/change-password
app.post('/api/admin/change-password', (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ success: false, message: 'Chưa xác thực quyền Admin!' });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 4 ký tự!' });
  }

  matchState = loadState();
  matchState.adminPassword = newPassword.trim();
  saveState(matchState);

  res.json({ success: true, message: 'Đổi mật khẩu Admin thành công!' });
});

export default (req, res) => {
  return app(req, res);
};
