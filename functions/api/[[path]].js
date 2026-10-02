// Cloudflare Pages Functions: Fullstack Serverless API for Football Match Manager
// Runs natively on Cloudflare Edge with 0 dependencies and zero credit issues

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};

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

// Global in-memory fallback
let memoryState = null;

function findKV(env) {
  if (!env) return null;
  if (env.MATCH_KV && typeof env.MATCH_KV.get === 'function') return env.MATCH_KV;
  if (env.FOOTBALL_KV && typeof env.FOOTBALL_KV.get === 'function') return env.FOOTBALL_KV;
  for (const [key, value] of Object.entries(env)) {
    if (value && typeof value.get === 'function' && typeof value.put === 'function') {
      return value;
    }
  }
  return null;
}

async function getState(env) {
  const kv = findKV(env);
  if (kv) {
    try {
      const data = await kv.get('current_match', 'json');
      if (data && data.title) return data;
      const initial = getDefaultMatchState();
      await kv.put('current_match', JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error('KV get error:', e);
    }
  }

  if (memoryState) return memoryState;
  memoryState = getDefaultMatchState();
  return memoryState;
}

async function putState(env, data) {
  data.lastUpdated = new Date().toISOString();
  memoryState = data;
  const kv = findKV(env);
  if (kv) {
    try {
      await kv.put('current_match', JSON.stringify(data));
    } catch (e) {
      console.error('KV put error:', e);
    }
  }
}

function getPublicState(state, env) {
  const { adminPassword, ...publicData } = state;
  const kv = findKV(env);
  return {
    ...publicData,
    hasPasswordSet: Boolean(adminPassword),
    hasDatabase: Boolean(kv)
  };
}

function verifyAdmin(request, state) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return token === state.adminPassword;
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const state = await getState(env);

    // 1. GET /api/match or /api
    if (method === 'GET' && (pathname === '/api/match' || pathname === '/api')) {
      return new Response(JSON.stringify({
        success: true,
        data: getPublicState(state, env)
      }), { headers: corsHeaders });
    }

    // Helper to parse JSON body safely
    const getBody = async () => {
      try {
        return await request.json();
      } catch {
        return {};
      }
    };

    // 2. POST /api/player/join
    if (method === 'POST' && pathname === '/api/player/join') {
      const body = await getBody();
      const { name, note } = body;
      if (!name || !name.trim()) {
        return new Response(JSON.stringify({ success: false, message: 'Vui lòng nhập tên của bạn!' }), { status: 400, headers: corsHeaders });
      }

      const cleanName = name.trim();
      const exists = state.players.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
      if (exists) {
        return new Response(JSON.stringify({ success: false, message: 'Tên này đã có trong danh sách! Bạn có thể thêm số hoặc họ để phân biệt.' }), { status: 400, headers: corsHeaders });
      }

      if (state.status === 'LOCKED') {
        return new Response(JSON.stringify({ success: false, message: 'Danh sách đã bị khóa bởi quản trị viên!' }), { status: 400, headers: corsHeaders });
      }

      const newPlayer = {
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: cleanName,
        note: note ? note.trim() : '',
        team: 0,
        createdAt: new Date().toISOString()
      };

      state.players.push(newPlayer);
      await putState(env, state);

      return new Response(JSON.stringify({ success: true, player: newPlayer }), { headers: corsHeaders });
    }

    // 3. POST /api/player/leave
    if (method === 'POST' && pathname === '/api/player/leave') {
      const body = await getBody();
      const { playerId } = body;
      if (!playerId) {
        return new Response(JSON.stringify({ success: false, message: 'Thiếu thông tin cầu thủ!' }), { status: 400, headers: corsHeaders });
      }

      const initialCount = state.players.length;
      state.players = state.players.filter(p => p.id !== playerId);

      if (state.players.length !== initialCount) {
        await putState(env, state);
        return new Response(JSON.stringify({ success: true, message: 'Đã hủy đăng ký thành công.', data: getPublicState(state, env) }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ success: false, message: 'Không tìm thấy cầu thủ.' }), { status: 404, headers: corsHeaders });
    }

    // 4. POST /api/admin/login
    if (method === 'POST' && pathname === '/api/admin/login') {
      const body = await getBody();
      const { password } = body;
      if (password === state.adminPassword) {
        return new Response(JSON.stringify({ success: true, token: state.adminPassword }), { headers: corsHeaders });
      }
      return new Response(JSON.stringify({ success: false, message: 'Mật khẩu quản trị viên không chính xác!' }), { status: 401, headers: corsHeaders });
    }

    // 5. POST /api/admin/update-match
    if (method === 'POST' && pathname === '/api/admin/update-match') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const { title, stadium, location, matchDate, matchTime, maxPlayers, notes, status, teamCount } = body;

      if (title !== undefined) state.title = title;
      if (stadium !== undefined) state.stadium = stadium;
      if (location !== undefined) state.location = location;
      if (matchDate !== undefined) state.matchDate = matchDate;
      if (matchTime !== undefined) state.matchTime = matchTime;
      if (maxPlayers !== undefined) state.maxPlayers = Number(maxPlayers);
      if (notes !== undefined) state.notes = notes;
      if (status !== undefined) state.status = status;
      if (teamCount !== undefined) state.teamCount = Number(teamCount);

      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 6. POST /api/admin/random-split
    if (method === 'POST' && pathname === '/api/admin/random-split') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const teamCount = Number(body.teamCount) || state.teamCount || 2;
      state.teamCount = teamCount;

      if (state.players.length < 2) {
        return new Response(JSON.stringify({ success: false, message: 'Cần ít nhất 2 cầu thủ để chia đội!' }), { status: 400, headers: corsHeaders });
      }

      const shuffled = [...state.players];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      shuffled.forEach((player, idx) => {
        player.team = (idx % teamCount) + 1;
      });

      state.players = shuffled;
      state.status = 'BALANCED';

      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 7. POST /api/admin/reset-teams
    if (method === 'POST' && pathname === '/api/admin/reset-teams') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      state.players.forEach(p => { p.team = 0; });
      state.status = 'OPEN';

      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 8. POST /api/admin/update-player-team
    if (method === 'POST' && pathname === '/api/admin/update-player-team') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const { playerId, team } = body;
      const player = state.players.find(p => p.id === playerId);
      if (!player) {
        return new Response(JSON.stringify({ success: false, message: 'Không tìm thấy cầu thủ!' }), { status: 404, headers: corsHeaders });
      }

      player.team = Number(team);
      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 9. POST /api/admin/swap-players
    if (method === 'POST' && pathname === '/api/admin/swap-players') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const { player1Id, player2Id } = body;
      const p1 = state.players.find(p => p.id === player1Id);
      const p2 = state.players.find(p => p.id === player2Id);
      if (!p1 || !p2) {
        return new Response(JSON.stringify({ success: false, message: 'Không tìm thấy 1 trong 2 cầu thủ!' }), { status: 404, headers: corsHeaders });
      }

      const tempTeam = p1.team;
      p1.team = p2.team;
      p2.team = tempTeam;

      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 10. POST /api/admin/edit-player
    if (method === 'POST' && pathname === '/api/admin/edit-player') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const { playerId, name } = body;
      const player = state.players.find(p => p.id === playerId);
      if (!player) {
        return new Response(JSON.stringify({ success: false, message: 'Không tìm thấy cầu thủ!' }), { status: 404, headers: corsHeaders });
      }

      if (name && name.trim()) {
        player.name = name.trim();
      }

      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 11. POST /api/admin/delete-player
    if (method === 'POST' && pathname === '/api/admin/delete-player') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const { playerId } = body;
      state.players = state.players.filter(p => p.id !== playerId);

      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 12. POST /api/admin/add-player
    if (method === 'POST' && pathname === '/api/admin/add-player') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const { name, team } = body;
      if (!name || !name.trim()) {
        return new Response(JSON.stringify({ success: false, message: 'Vui lòng nhập tên!' }), { status: 400, headers: corsHeaders });
      }

      const newPlayer = {
        id: 'p_admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: name.trim(),
        team: Number(team) || 0,
        createdAt: new Date().toISOString()
      };

      state.players.push(newPlayer);
      await putState(env, state);

      return new Response(JSON.stringify({ success: true, player: newPlayer }), { headers: corsHeaders });
    }

    // 13. POST /api/admin/clear-players
    if (method === 'POST' && pathname === '/api/admin/clear-players') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      state.players = [];
      state.status = 'OPEN';

      await putState(env, state);
      return new Response(JSON.stringify({ success: true, data: getPublicState(state, env) }), { headers: corsHeaders });
    }

    // 14. POST /api/admin/change-password
    if (method === 'POST' && pathname === '/api/admin/change-password') {
      if (!verifyAdmin(request, state)) {
        return new Response(JSON.stringify({ success: false, message: 'Chưa xác thực quyền Admin!' }), { status: 403, headers: corsHeaders });
      }

      const body = await getBody();
      const { newPassword } = body;
      if (!newPassword || newPassword.trim().length < 4) {
        return new Response(JSON.stringify({ success: false, message: 'Mật khẩu mới tối thiểu 4 ký tự!' }), { status: 400, headers: corsHeaders });
      }

      state.adminPassword = newPassword.trim();
      await putState(env, state);

      return new Response(JSON.stringify({ success: true, message: 'Đổi mật khẩu Admin thành công!' }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: false, message: 'Endpoint not found: ' + pathname }), { status: 404, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err?.message || 'Server error' }), { status: 500, headers: corsHeaders });
  }
}
