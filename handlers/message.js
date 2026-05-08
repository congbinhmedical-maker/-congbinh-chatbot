const { callOpenAI } = require('../services/openai');
const { sendMessage, sendImage, getUserName } = require('../services/facebook');
const { extractImageTag, getImageUrl } = require('../services/productImages');
const conv = require('../services/conversation');
const { isHumanTakeover } = require('../services/conversation');

async function handleMessage(event) {
  const senderId = event.sender.id;
  const text = event.message?.text;
  if (!text) return;

  console.log(`📨 Tin nhắn từ ${senderId}: ${text}`);

  // Kiểm tra bot có đang bật không
  if (process.env.BOT_ENABLED === 'false') {
    console.log(`🔴 Bot đang TẮT — bỏ qua tin nhắn từ ${senderId}`);
    return;
  }

  // Nếu đang có người thật trực → bot không trả lời
  if (isHumanTakeover(senderId)) {
    console.log(`👤 Human takeover đang bật — bỏ qua tin nhắn từ ${senderId}`);
    return;
  }

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

  // Tách tag ảnh nếu AI có gắn [IMG:key]
  const { cleanText, imageKey } = extractImageTag(reply);

  // Lưu câu trả lời vào lịch sử (không có tag)
  session.history.push({ role: 'assistant', content: cleanText });
  conv.update(senderId, session);

  // Gửi text trước
  await sendMessage(senderId, cleanText);

  // Gửi ảnh kèm nếu có
  if (imageKey) {
    const imgUrl = getImageUrl(imageKey);
    if (imgUrl) {
      await sendImage(senderId, imgUrl);
      console.log(`🖼️ Đã gửi ảnh sản phẩm: ${imageKey}`);
    }
  }

  console.log(`✅ Đã trả lời ${senderId}`);
}

module.exports = { handleMessage };
