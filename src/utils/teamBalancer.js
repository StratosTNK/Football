/**
 * Positions and Skill Ratings Configuration for Football Match Manager
 */

export const POSITIONS = {
  FW: { 
    id: 'FW', 
    name: 'Tiền đạo', 
    shortLabel: 'Tiền đạo', 
    icon: '🎯', 
    color: '#FF4757', 
    badgeBg: 'rgba(255, 71, 87, 0.15)',
    border: 'rgba(255, 71, 87, 0.4)'
  },
  MF: { 
    id: 'MF', 
    name: 'Tiền vệ', 
    shortLabel: 'Tiền vệ', 
    icon: '⚽', 
    color: '#00F298', 
    badgeBg: 'rgba(0, 242, 152, 0.15)',
    border: 'rgba(0, 242, 152, 0.4)'
  },
  DF: { 
    id: 'DF', 
    name: 'Hậu vệ', 
    shortLabel: 'Hậu vệ', 
    icon: '🛡️', 
    color: '#1E90FF', 
    badgeBg: 'rgba(30, 144, 255, 0.15)',
    border: 'rgba(30, 144, 255, 0.4)'
  },
  GK: { 
    id: 'GK', 
    name: 'Thủ môn', 
    shortLabel: 'Thủ môn', 
    icon: '🧤', 
    color: '#FFA502', 
    badgeBg: 'rgba(255, 165, 2, 0.15)',
    border: 'rgba(255, 165, 2, 0.4)'
  }
};

export const RATINGS = {
  S: {
    id: 'S',
    name: 'Hạng S',
    label: 'Đá hay, toàn diện',
    score: 10,
    color: '#FFD700',
    star: '⭐',
    badge: '⭐ S',
    bg: 'rgba(255, 215, 0, 0.12)',
    border: 'rgba(255, 215, 0, 0.35)',
    desc: 'Đá hay, công thủ toàn diện'
  },
  A: {
    id: 'A',
    name: 'Hạng A',
    label: 'Biết đá, 1 sở trường',
    score: 6,
    color: '#A78BFA',
    star: '⚡',
    badge: '⚡ A',
    bg: 'rgba(167, 139, 250, 0.12)',
    border: 'rgba(167, 139, 250, 0.35)',
    desc: 'Biết đá và mạnh 1 sở trường'
  },
  B: {
    id: 'B',
    name: 'Hạng B',
    label: 'Biết nhưng chưa tốt',
    score: 3,
    color: '#38BDF8',
    star: '🟢',
    badge: '🟢 B',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
    desc: 'Biết nhưng đá chưa tốt'
  },
  'Ổn': {
    id: 'Ổn',
    name: 'Mức Ổn',
    label: 'Đá ở mức ổn',
    score: 5,
    color: '#00F298',
    star: '⚪',
    badge: '⚪ Ổn',
    bg: 'rgba(0, 242, 152, 0.12)',
    border: 'rgba(0, 242, 152, 0.35)',
    desc: 'Khả năng cơ bản, đá ở mức ổn'
  }
};

export const RATING_SCORES = {
  S: 10,
  A: 6,
  B: 3,
  'Ổn': 5
};

/**
 * Derive player's primary role and rating from their capability matrix
 */
export function derivePlayerAttributes(skills = {}) {
  const tierWeight = { 'S': 4, 'A': 3, 'B': 2, 'Ổn': 1 };
  
  const picks = Object.entries(skills).filter(([_, val]) => val && val !== 'Ổn');
  
  // Sort picks by tier weight descending (S > A > B)
  picks.sort((a, b) => (tierWeight[b[1]] || 1) - (tierWeight[a[1]] || 1));

  let primaryPos = 'MF';
  let primaryRating = 'Ổn';

  if (picks.length > 0) {
    primaryPos = picks[0][0]; // highest rated position
    primaryRating = picks[0][1];
  }

  const strongPositions = picks.map(p => `${p[0]}-${p[1]}`);

  return {
    primaryPosition: primaryPos,
    primaryRating: primaryRating,
    strongPositions,
    picks
  };
}

/**
 * Calculate team statistics (total score, tier counts, position counts)
 */
export function calculateTeamStats(teamPlayers = []) {
  const stats = {
    count: teamPlayers.length,
    totalScore: 0,
    ratings: { S: 0, A: 0, B: 0, 'Ổn': 0 },
    positions: { GK: 0, DF: 0, MF: 0, FW: 0 }
  };

  teamPlayers.forEach(p => {
    let r = p.rating;
    let pos = p.position;
    if (p.skills && typeof p.skills === 'object') {
      const derived = derivePlayerAttributes(p.skills);
      if (!pos || pos === 'MF') pos = derived.primaryPosition;
      if (!r) r = derived.primaryRating;
    }
    r = r && RATINGS[r] ? r : 'Ổn';
    pos = pos && POSITIONS[pos] ? pos : 'MF';

    stats.totalScore += RATING_SCORES[r] || 5;
    stats.ratings[r] = (stats.ratings[r] || 0) + 1;
    stats.positions[pos] = (stats.positions[pos] || 0) + 1;
  });

  return stats;
}

/**
 * Intelligent Fair Team Division Algorithm
 * Balances both Player Skill Tier (S-A-B) and Playing Position (FW-MF-DF-GK)
 */
export function balanceTeams(players, teamCount = 2) {
  if (!players || players.length < 2) return players || [];
  const count = Number(teamCount) || 2;

  // 1. Clone and normalize player attributes
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
      rating: (rating && ['S', 'A', 'B', 'Ổn'].includes(rating)) ? rating : 'Ổn'
    };
  });

  // Shuffle pool with Fisher-Yates so identical tier+position players get randomized pairings
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 2. Initialize team buckets
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

  // Group players by position
  const gks = pool.filter(p => p.position === 'GK');
  const dfs = pool.filter(p => p.position === 'DF');
  const fws = pool.filter(p => p.position === 'FW');
  const mfs = pool.filter(p => p.position === 'MF');

  const distributeGroup = (list) => {
    // Sort players in this position by rating descending (S -> A -> Ổn -> B)
    list.sort((a, b) => (RATING_SCORES[b.rating] || 5) - (RATING_SCORES[a.rating] || 5));

    for (const player of list) {
      // Find the team with:
      // 1. Least players of this position
      // 2. Least total players
      // 3. Lowest total skill score
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

  // Distribute in strategic order: Goalkeepers first, then Defenders, then Attackers, then Midfielders
  distributeGroup(gks);
  distributeGroup(dfs);
  distributeGroup(fws);
  distributeGroup(mfs);

  // Post-balancing optimization: Equal-position swaps to minimize skill gap
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

  // Return full player list mapped with their final team assignment
  const resultMap = new Map();
  teams.forEach(t => {
    t.players.forEach(p => resultMap.set(p.id, p));
  });

  return pool.map(p => resultMap.get(p.id) || p);
}
