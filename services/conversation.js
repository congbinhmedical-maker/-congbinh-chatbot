const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/conversations.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
}

function save(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function get(userId) {
  const all = load();
  if (!all[userId]) {
    all[userId] = {
      history: [],
      postContext: null,
      phoneCollected: false,
      name: null,
      humanTakeover: false,
      humanTakeoverAt: null,
      createdAt: new Date().toISOString()
    };
    save(all);
  }
  return all[userId];
}

// Bật human takeover — bot im lặng
function setHumanTakeover(userId, active) {
  const all = load();
  if (!all[userId]) get(userId);
  const data = load();
  data[userId].humanTakeover = active;
  data[userId].humanTakeoverAt = active ? new Date().toISOString() : null;
  save(data);
}

// Kiểm tra có đang trong chế độ human takeover không
// Tự động reset sau 8 tiếng nếu không có người trực
function isHumanTakeover(userId) {
  const all = load();
  const session = all[userId];
  if (!session || !session.humanTakeover) return false;

  // Tự reset sau 15 phút không có người trực
  const takeoverAt = new Date(session.humanTakeoverAt);
  const minutesElapsed = (Date.now() - takeoverAt) / (1000 * 60);
  if (minutesElapsed >= 15) {
    setHumanTakeover(userId, false);
    return false;
  }
  return true;
}

function update(userId, conv) {
  const all = load();
  // Giữ tối đa 20 tin nhắn gần nhất
  if (conv.history.length > 20) conv.history = conv.history.slice(-20);
  all[userId] = conv;
  save(all);
}

// Kiểm tra có số điện thoại trong tin nhắn không
function extractPhone(text) {
  const match = text.match(/(\+84|0)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}/);
  return match ? match[0] : null;
}

module.exports = { get, update, extractPhone, setHumanTakeover, isHumanTakeover };
