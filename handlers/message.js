const { callOpenAI } = require('../services/openai');
const { sendMessage, getUserName } = require('../services/facebook');
const conv = require('../services/conversation');

async function handleMessage(event) {
  const senderId = event.sender.id;
  const text = event.message?.text;
  if (!text) return;

  console.log(`📨 Tin nhắn từ ${senderId}: ${text}`);

  const session = conv.get(senderId);

  // Lấy họ tên đầy đủ nếu chưa có
  if (!session.name) {
    session.name = await getUserName(senderId);
  }

  // Kiểm tra có số điện thoại không
  const phone = conv.extractPhone(text);
  if (phone && !session.phoneCollected) {
    session.phoneCollected = true;
    console.log(`📞 SỐ MỚI — UserID: ${senderId} | SĐT: ${phone}`);
    // Ghi ra file riêng để ông chủ dễ check
    const fs = require('fs');
    const logLine = `[${new Date().toLocaleString('vi-VN')}] ${senderId} → ${phone}\n`;
    fs.appendFileSync(require('path').join(__dirname, '../data/phone_leads.txt'), logLine, 'utf8');
  }

  // Thêm tin nhắn khách vào lịch sử
  session.history.push({ role: 'user', content: text });

  // Gọi AI tạo câu trả lời
  const reply = await callOpenAI(session.history, session.postContext, session.phoneCollected, session.name);

  // Lưu câu trả lời vào lịch sử
  session.history.push({ role: 'assistant', content: reply });
  conv.update(senderId, session);

  // Gửi trả lời
  await sendMessage(senderId, reply);
  console.log(`✅ Đã trả lời ${senderId}`);
}

module.exports = { handleMessage };
