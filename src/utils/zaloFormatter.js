/**
 * Format match information and teams into ready-to-paste text for Zalo / Facebook Messenger
 */
export const formatMatchForZalo = (match) => {
  if (!match) return '';

  const { title, stadium, location, matchDate, matchTime, players, teamCount, status } = match;

  let text = `⚽ ${title.toUpperCase()} ⚽\n`;
  text += `📅 Ngày đá: ${matchDate}\n`;
  text += `⏰ Giờ đá: ${matchTime}\n`;
  text += `📍 Sân: ${stadium}\n`;
  if (location) text += `📌 Địa chỉ: ${location}\n`;
  text += `👥 Số lượng hiện tại: ${players.length}${match.maxPlayers ? `/${match.maxPlayers}` : ''} cầu thủ\n`;
  text += `────────────────────\n`;

  // If teams are balanced
  if (status === 'BALANCED') {
    const teamsMeta = [
      { id: 1, name: '🔴 ĐỘI ĐỎ', prefix: '🔴' },
      { id: 2, name: '🔵 ĐỘI XANH', prefix: '🔵' },
      { id: 3, name: '🟡 ĐỘI VÀNG', prefix: '🟡' }
    ];

    const actualTeamCount = teamCount || 2;
    for (let t = 1; t <= actualTeamCount; t++) {
      const meta = teamsMeta[t - 1] || { name: `ĐỘI ${t}`, prefix: '⚪' };
      const teamPlayers = players.filter(p => p.team === t);
      text += `\n${meta.name} (${teamPlayers.length} người):\n`;
      if (teamPlayers.length === 0) {
        text += `  (Chưa có cầu thủ)\n`;
      } else {
        teamPlayers.forEach((p, idx) => {
          text += `  ${idx + 1}. ${p.name}\n`;
        });
      }
    }

    const unassigned = players.filter(p => !p.team || p.team === 0);
    if (unassigned.length > 0) {
      text += `\n⚪ DỰ BỊ / CHƯA GÁN (${unassigned.length} người):\n`;
      unassigned.forEach((p, idx) => {
        text += `  ${idx + 1}. ${p.name}\n`;
      });
    }
  } else {
    // Attendance list
    text += `📋 DANH SÁCH ĐIỂM DANH:\n`;
    if (players.length === 0) {
      text += `(Chưa có ai điểm danh)\n`;
    } else {
      players.forEach((p, idx) => {
        text += `${idx + 1}. ${p.name}\n`;
      });
    }
  }

  text += `\n👉 Link xem & cập nhật trực tiếp: ${window.location.href}`;
  return text;
};
