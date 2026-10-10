import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'match.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Compute default upcoming match date (e.g. tomorrow at 19:30)
const getDefaultMatchState = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  return {
    title: "Giao hữu giữa Thể Thao - Thanh Khê",
    stadium: "Sân ĐH TDTT Đà Nẵng",
    location: "44 Dũng Sĩ Thanh Khê, P. Thanh Khê Đông, Q. Thanh Khê, Đà Nẵng",
    matchDate: dateStr,
    matchTime: "19:30 - 21:00",
    maxPlayers: 14,
    teamCount: 2, // 2 đội (Đỏ vs Xanh) hoặc 3 đội
    status: "OPEN", // OPEN, BALANCED, LOCKED
    notes: "Anh em đến sớm 10 phút để khởi động và mặc áo theo đội. Mang giày đinh dăm TF!",
    adminPassword: "admin123", // Mật khẩu quản trị duy nhất
    defaultTrackId: "waka-waka",
    players: [
      { id: "p1", name: "Nguyễn Tuấn", note: "Đến đúng giờ", team: 0, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "p2", name: "Trần Minh Khoa", note: "Đem 2 quả bóng", team: 0, createdAt: new Date(Date.now() - 3000000).toISOString() },
      { id: "p3", name: "Hoàng Nam", note: "", team: 0, createdAt: new Date(Date.now() - 2500000).toISOString() },
      { id: "p4", name: "Văn Hưng", note: "", team: 0, createdAt: new Date(Date.now() - 2000000).toISOString() },
      { id: "p5", name: "Đức Trí", note: "Trễ 5p", team: 0, createdAt: new Date(Date.now() - 1500000).toISOString() },
      { id: "p6", name: "Quốc Bảo", note: "", team: 0, createdAt: new Date(Date.now() - 1000000).toISOString() },
      { id: "p7", name: "Thanh Tùng", note: "", team: 0, createdAt: new Date(Date.now() - 800000).toISOString() },
      { id: "p8", name: "Tiến Dũng", note: "", team: 0, createdAt: new Date(Date.now() - 600000).toISOString() },
      { id: "p9", name: "Anh Tuấn", note: "", team: 0, createdAt: new Date(Date.now() - 400000).toISOString() },
      { id: "p10", name: "Hữu Thắng", note: "", team: 0, createdAt: new Date(Date.now() - 200000).toISOString() }
    ],
    lastUpdated: new Date().toISOString()
  };
};

export const loadMatchData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return data;
    }
  } catch (error) {
    console.error('Error reading match data file, using defaults:', error);
  }
  const defaultData = getDefaultMatchState();
  saveMatchData(defaultData);
  return defaultData;
};

export const saveMatchData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving match data:', error);
    return false;
  }
};
