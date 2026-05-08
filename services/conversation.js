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
      createdAt: new Date().toISOString()
    };
    save(all);
  }
  return all[userId];
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

module.exports = { get, update, extractPhone };
