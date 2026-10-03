// Cloudflare Pages Functions: Fullstack Serverless API for Football Match Manager
// Runs natively on Cloudflare Edge with 0 dependencies and zero credit issues

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0'
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
  let kvData = null;
  if (kv) {
    try {
      kvData = await kv.get('current_match', 'json');
    } catch (e) {
      console.error('KV get error:', e);
    }
  }

  // If memoryState exists and is newer than kvData, prioritize memoryState to prevent eventual consistency lag
  if (memoryState && memoryState.lastUpdated) {
    if (!kvData || !kvData.lastUpdated || new Date(memoryState.lastUpdated) > new Date(kvData.lastUpdated)) {
      return memoryState;
    }
  }

  if (kvData && kvData.title) {
    memoryState = kvData;
    return kvData;
  }

  if (memoryState && memoryState.title) return memoryState;

  const initial = getDefaultMatchState();
  if (kv) {
    try {
      await kv.put('current_match', JSON.stringify(initial));
    } catch (e) {
      console.error('KV put error:', e);
    }
  }
  memoryState = initial;
  return initial;
}

async function putState(env, data) {
  data.lastUpdated = new Date().toISOString();
  memoryState = JSON.parse(JSON.stringify(data));
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

const RATING_SCORES = { S: 10, A: 7, B: 5, C: 3, 'Ổn': 5 };

function derivePlayerAttributes(skills = {}) {
  const tierWeight = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'Ổn': 2 };
  const picks = Object.entries(skills).filter(([_, val]) => val && val !== 'B' && val !== 'Ổn');
  picks.sort((a, b) => (tierWeight[b[1]] || 2) - (tierWeight[a[1]] || 2));
  let primaryPos = 'MF';
  let primaryRating = 'B';
  if (picks.length > 0) {
    primaryPos = picks[0][0];
    primaryRating = picks[0][1] === 'Ổn' ? 'B' : picks[0][1];
  }
  return { primaryPosition: primaryPos, primaryRating };
}

function balanceTeams(players, teamCount = 2) {
  if (!players || players.length < 2) return players || [];
  const count = Number(teamCount) || 2;

  const pool = players.map(p => {
    let position = p.position;
    let rating = p.rating;
    if (p.skills && typeof p.skills === 'object') {
      const derived = derivePlayerAttributes(p.skills);
      if (!position || position === 'MF') position = derived.primaryPosition;
      if (!rating) rating = derived.primaryRating;
    }
    return {
      ...p,
      position: (position && ['FW', 'MF', 'DF', 'GK'].includes(position)) ? position : 'MF',
      rating: (rating && ['S', 'A', 'B', 'C', 'Ổn'].includes(rating)) ? (rating === 'Ổn' ? 'B' : rating) : 'B'
    };
  });

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const teams = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    players: [],
    score: 0,
    positions: { GK: 0, DF: 0, MF: 0, FW: 0 }
  }));

  const assign = (team, player) => {
    team.players.push(player);
    player.team = team.id;
    team.score += (RATING_SCORES[player.rating] || 5);
    team.positions[player.position] = (team.positions[player.position] || 0) + 1;
  };

  const gks = pool.filter(p => p.position === 'GK');
  const dfs = pool.filter(p => p.position === 'DF');
  const fws = pool.filter(p => p.position === 'FW');
  const mfs = pool.filter(p => p.position === 'MF');

  const distributeGroup = (list) => {
    list.sort((a, b) => (RATING_SCORES[b.rating] || 6) - (RATING_SCORES[a.rating] || 6));
    for (const player of list) {
      const sortedTeams = [...teams].sort((t1, t2) => {
        const posDiff = (t1.positions[player.position] || 0) - (t2.positions[player.position] || 0);
        if (posDiff !== 0) return posDiff;

        const sizeDiff = t1.players.length - t2.players.length;
        if (sizeDiff !== 0) return sizeDiff;

        return t1.score - t2.score;
      });

      assign(sortedTeams[0], player);
    }
  };

  distributeGroup(gks);
  distributeGroup(dfs);
  distributeGroup(fws);
  distributeGroup(mfs);

  // Equal-position swaps optimization to minimize skill gap
  let improved = true;
  let iterations = 0;
  while (improved && iterations < 20) {
    improved = false;
    iterations++;

    teams.sort((a, b) => b.score - a.score);
    const highest = teams[0];
    const lowest = teams[teams.length - 1];
    const diff = highest.score - lowest.score;

    if (diff > 2) {
      let bestSwap = null;
      let bestNewDiff = diff;

      for (const pHigh of highest.players) {
        for (const pLow of lowest.players) {
          if (pHigh.position === pLow.position) {
            const scoreChange = (RATING_SCORES[pHigh.rating] || 6) - (RATING_SCORES[pLow.rating] || 6);
            if (scoreChange > 0) {
              const newHigh = highest.score - scoreChange;
              const newLow = lowest.score + scoreChange;
              const newDiff = Math.abs(newHigh - newLow);
              if (newDiff < bestNewDiff) {
                bestNewDiff = newDiff;
                bestSwap = { pHigh, pLow, change: scoreChange };
              }
            }
          }
        }
      }

      if (bestSwap) {
        const { pHigh, pLow, change } = bestSwap;
        pHigh.team = lowest.id;
        pLow.team = highest.id;

        highest.players = highest.players.filter(p => p.id !== pHigh.id).concat(pLow);
        lowest.players = lowest.players.filter(p => p.id !== pLow.id).concat(pHigh);

        highest.score -= change;
        lowest.score += change;

        improved = true;
      }
    }
  }

  const resultMap = new Map();
  teams.forEach(t => {
    t.players.forEach(p => resultMap.set(p.id, p));
  });

  return pool.map(p => resultMap.get(p.id) || p);
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
      const { name, note, position, rating, skills } = body;
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

      const validPositions = ['FW', 'MF', 'DF', 'GK'];
      const validRatings = ['S', 'A', 'B', 'C', 'Ổn'];

      const pos = validPositions.includes(position) ? position : 'MF';
      const rat = validRatings.includes(rating) ? (rating === 'Ổn' ? 'B' : rating) : 'B';

      const newPlayer = {
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: cleanName,
        note: note ? note.trim() : '',
        position: pos,
        rating: rat,
        skills: (skills && typeof skills === 'object') ? skills : { FW: 'B', MF: 'B', DF: 'B', GK: 'B' },
        team: 0,
        createdAt: new Date().toISOString()
      };

      state.players.push(newPlayer);
      await putState(env, state);

      return new Response(JSON.stringify({ success: true, player: newPlayer, data: getPublicState(state, env) }), { headers: corsHeaders });
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

      state.players = balanceTeams(state.players, teamCount);
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
      const { playerId, name, position, rating, skills } = body;
      const player = state.players.find(p => p.id === playerId);
      if (!player) {
        return new Response(JSON.stringify({ success: false, message: 'Không tìm thấy cầu thủ!' }), { status: 404, headers: corsHeaders });
      }

      if (name && name.trim()) {
        player.name = name.trim();
      }
      if (skills && typeof skills === 'object') {
        player.skills = skills;
        const derived = derivePlayerAttributes(skills);
        if (!position) player.position = derived.primaryPosition;
        if (!rating) player.rating = derived.primaryRating;
      }
      if (position && ['FW', 'MF', 'DF', 'GK'].includes(position)) {
        player.position = position;
      }
      if (rating && ['S', 'A', 'B', 'C', 'Ổn'].includes(rating)) {
        player.rating = rating === 'Ổn' ? 'B' : rating;
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
      const { name, team, position, rating } = body;
      if (!name || !name.trim()) {
        return new Response(JSON.stringify({ success: false, message: 'Vui lòng nhập tên!' }), { status: 400, headers: corsHeaders });
      }

      const pos = ['FW', 'MF', 'DF', 'GK'].includes(position) ? position : 'MF';
      const rat = ['S', 'A', 'B'].includes(rating) ? rating : 'A';

      const newPlayer = {
        id: 'p_admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: name.trim(),
        position: pos,
        rating: rat,
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
