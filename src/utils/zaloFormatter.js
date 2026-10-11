/**
 * Convert YYYY-MM-DD to DD/MM/YYYY (Ngày/Tháng/Năm)
 */
export const formatDateDMY = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).trim().split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

/**
 * Format match information into ready-to-paste text for Zalo / Messenger
 */
export const formatMatchForZalo = (match) => {
  if (!match) return '';

  const { title, stadium, matchDate, matchTime, players } = match;
  const matchTitle = (title || 'GIAO HỮU BÓNG ĐÁ').toUpperCase();
  const dateFormatted = formatDateDMY(matchDate);
  const timeStr = matchTime || '';
  const stadiumStr = stadium || '';
  const count = players ? players.length : 0;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';

  let text = `⚽ ${matchTitle} ⚽\n`;
  text += `📅 Ngày đá: ${dateFormatted}\n`;
  text += `⏰ Giờ đá: ${timeStr}\n`;
  text += `📍 Sân: ${stadiumStr}\n`;
  text += `👥 Số lượng tham gia: ${count} cầu thủ\n\n`;
  text += `👉 Link xem & cập nhật trực tiếp: ${currentUrl}`;

  return text;
};

/**
 * Format team division result into ready-to-paste text for Zalo (2-column format)
 */
export const formatTeamsForZalo = (match) => {
  if (!match) return '';

  const { title, stadium, matchDate, matchTime, players, teamCount } = match;
  const matchTitle = (title || 'GIAO HỮU BÓNG ĐÁ').toUpperCase();
  const dateFormatted = formatDateDMY(matchDate);
  const timeStr = matchTime || '';
  const stadiumStr = stadium || '';
  const count = players ? players.length : 0;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';

  let text = `⚽ ${matchTitle} ⚽\n`;
  text += `📅 Ngày đá: ${dateFormatted}\n`;
  text += `⏰ Giờ đá: ${timeStr}\n`;
  text += `📍 Sân: ${stadiumStr}\n`;
  text += `👥 Số lượng tham gia: ${count} cầu thủ\n`;
  text += `────────────────────\n`;
  text += `⚔️ KẾT QUẢ CHIA ĐỘI:\n`;

  const actualTeamCount = teamCount || 2;
  const team1 = (players || []).filter(p => p.team === 1);
  const team2 = (players || []).filter(p => p.team === 2);
  const team3 = (players || []).filter(p => p.team === 3);

  const playerLabel = (p, idx) => {
    if (!p) return '';
    let label = '';
    if (p.skills && typeof p.skills === 'object') {
      const picks = Object.entries(p.skills).filter(([_, v]) => v && v !== 'B' && v !== 'Ổn');
      if (picks.length > 0) {
        label = picks.map(([pos, rat]) => `${pos}-${rat === 'Ổn' ? 'B' : rat}`).join('/');
      }
    }
    if (!label) {
      const pos = p.position || 'MF';
      const rat = p.rating ? (p.rating === 'Ổn' ? 'B' : p.rating) : 'B';
      label = `${pos}-${rat}`;
    }
    return `${idx + 1}. ${p.name} [${label}]`;
  };

  if (actualTeamCount === 2) {
    const padCol = (str, width) => {
      const len = str.length;
      if (len >= width) return str + '   ';
      return str + ' '.repeat(width - len);
    };

    let maxCol1Len = `🔴 ĐỘI ĐỎ (${team1.length})`.length;
    team1.forEach((p, idx) => {
      const itemLen = playerLabel(p, idx).length;
      if (itemLen > maxCol1Len) maxCol1Len = itemLen;
    });
    const col1Width = Math.min(Math.max(maxCol1Len + 3, 22), 32);

    const h1 = `🔴 ĐỘI ĐỎ (${team1.length})`;
    const h2 = `🔵 ĐỘI XANH (${team2.length})`;
    text += `\n${padCol(h1, col1Width)}${h2}\n`;
    text += `─`.repeat(Math.max(col1Width + h2.length, 36)) + `\n`;

    const maxRows = Math.max(team1.length, team2.length);
    for (let i = 0; i < maxRows; i++) {
      const c1 = team1[i] ? playerLabel(team1[i], i) : '';
      const c2 = team2[i] ? playerLabel(team2[i], i) : '';
      text += `${padCol(c1, col1Width)}${c2}\n`;
    }
  } else {
    // 3 teams
    const teamsMeta = [
      { id: 1, name: '🔴 ĐỘI ĐỎ', list: team1 },
      { id: 2, name: '🔵 ĐỘI XANH', list: team2 },
      { id: 3, name: '🟡 ĐỘI VÀNG', list: team3 }
    ];
    teamsMeta.forEach(tm => {
      text += `\n${tm.name} (${tm.list.length} người):\n`;
      if (tm.list.length === 0) {
        text += `  (Chưa có cầu thủ)\n`;
      } else {
        tm.list.forEach((p, idx) => {
          text += `  ${playerLabel(p, idx)}\n`;
        });
      }
    });
  }

  const unassigned = (players || []).filter(p => !p.team || p.team === 0);
  if (unassigned.length > 0) {
    text += `\n⚪ DỰ BỊ / CHƯA GÁN (${unassigned.length} người):\n`;
    unassigned.forEach((p, idx) => {
      text += `  ${playerLabel(p, idx)}\n`;
    });
  }

  text += `\n👉 Link xem & cập nhật trực tiếp: ${currentUrl}`;
  return text;
};

/**
 * Format pitch fee & drinks bill into ready-to-paste text for Zalo / Messenger
 */
export const formatPitchBillForZalo = (match, bill) => {
  if (!match || !bill) return '';

  const { title, stadium, matchDate, matchTime } = match;
  const clubName = 'DSU-THANH KHÊ CLUB';
  const matchTitle = (title || 'GIAO HỮU BÓNG ĐÁ').toUpperCase();
  const dateFormatted = formatDateDMY(matchDate);
  const timeStr = matchTime || '';
  const stadiumStr = stadium || '';

  const pitchCost = Number(bill.pitchCost) || 0;
  const drinkCost = Number(bill.drinkCost) || 0;
  const otherCost = Number(bill.otherCost) || 0;
  const totalAmount = Number(bill.totalAmount) || 0;
  const payingCount = Number(bill.payingCount) || 1;
  const perPlayer = Number(bill.perPlayer) || 0;
  const bank = bill.bank || {};
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + 'đ';

  let text = `⚽ ${clubName} ⚽\n`;
  text += `🧾 QUYẾT TOÁN TIỀN SÂN & NƯỚC UỐNG\n`;
  text += `📅 Ngày đá: ${dateFormatted} • ⏰ ${timeStr}\n`;
  if (stadiumStr) text += `📍 Sân: ${stadiumStr}\n`;
  text += `────────────────────\n`;
  text += `💰 Tiền sân: ${formatVND(pitchCost)}\n`;
  if (drinkCost > 0) text += `🥤 Tiền nước: ${formatVND(drinkCost)}\n`;
  if (otherCost !== 0) {
    text += `${otherCost > 0 ? '➕ Phụ phí' : '➖ Giảm trừ'}: ${formatVND(Math.abs(otherCost))}\n`;
  }
  text += `👉 TỔNG CỘNG: ${formatVND(totalAmount)}\n`;
  text += `👥 Số người chia: ${payingCount} cầu thủ\n`;
  text += `💵 MỖI NGƯỜI: ${formatVND(perPlayer)}\n`;

  if (bank.accountNo && bank.bankName) {
    text += `────────────────────\n`;
    text += `💳 THÔNG TIN CHUYỂN KHOẢN:\n`;
    text += `🏦 Ngân hàng: ${bank.bankName}\n`;
    text += `🔢 STK: ${bank.accountNo}\n`;
    if (bank.accountName) text += `👤 Tên chủ TK: ${bank.accountName.toUpperCase()}\n`;
    text += `📝 Nội dung: [Tên của bạn] chuyển tiền sân\n`;
    if (bill.qrUrl) text += `📲 Link quét mã QR: ${bill.qrUrl}\n`;
  }

  text += `────────────────────\n`;
  text += `Anh em chuyển khoản sớm giúp thủ quỹ nhé! Cảm ơn anh em! ⚽🔥\n`;
  text += `👉 Xem chi tiết trên web: ${currentUrl}`;

  return text;
};
