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
    color: '#2DD4BF',
    star: '🟢',
    badge: '🟢 B',
    bg: 'rgba(45, 212, 191, 0.12)',
    border: 'rgba(45, 212, 191, 0.35)',
    desc: 'Biết nhưng đá chưa tốt'
  }
};

export const RATING_SCORES = {
  S: 10,
  A: 6,
  B: 3
};

/**
 * Calculate team statistics (total score, tier counts, position counts)
 */
export function calculateTeamStats(teamPlayers = []) {
  const stats = {
    count: teamPlayers.length,
    totalScore: 0,
    ratings: { S: 0, A: 0, B: 0 },
    positions: { GK: 0, DF: 0, MF: 0, FW: 0 }
  };

  teamPlayers.forEach(p => {
    const r = p.rating && RATINGS[p.rating] ? p.rating : 'A';
    const pos = p.position && POSITIONS[p.position] ? p.position : 'MF';

    stats.totalScore += RATING_SCORES[r] || 6;
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
  const pool = players.map(p => ({
    ...p,
    position: (p.position && ['FW', 'MF', 'DF', 'GK'].includes(p.position)) ? p.position : 'MF',
    rating: (p.rating && ['S', 'A', 'B'].includes(p.rating)) ? p.rating : 'A'
  }));

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
    team.score += (RATING_SCORES[player.rating] || 6);
    team.positions[player.position] = (team.positions[player.position] || 0) + 1;
  };

  // Group players by position
  const gks = pool.filter(p => p.position === 'GK');
  const dfs = pool.filter(p => p.position === 'DF');
  const fws = pool.filter(p => p.position === 'FW');
  const mfs = pool.filter(p => p.position === 'MF');

  const distributeGroup = (list) => {
    // Sort players in this position by rating descending (S -> A -> B)
    list.sort((a, b) => (RATING_SCORES[b.rating] || 6) - (RATING_SCORES[a.rating] || 6));

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
