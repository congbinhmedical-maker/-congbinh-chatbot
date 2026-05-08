const { replyToComment, sendMessage, getPostContent } = require('../services/facebook');
const { callOpenAI } = require('../services/openai');
const conv = require('../services/conversation');

async function handleComment(data) {
  if (process.env.BOT_ENABLED === 'false') {
    console.log(`🔴 Bot đang TẮT — bỏ qua comment`);
    return;
  }
  const { post_id, comment_id, sender_id, sender_name, message } = data;

  // Lấy họ tên đầy đủ và tên gọi thân mật
  const fullName = sender_name || '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[nameParts.length - 1] || 'bạn'; // tên cuối (kiểu Việt)

  console.log(`💬 Comment từ ${sender_name} (${sender_id}): ${message}`);

  // 1. Reply ngay vào comment để mời vào DM
  const commentReply = `${fullName} ơi! Lâm vừa nhắn tin cho mình rồi nhé 😊 Kiểm tra hộp thư tin nhắn giúp Lâm với ạ!`;
  await replyToComment(comment_id, commentReply);

  // 2. Lấy nội dung bài viết để bot hiểu context
  const postContent = await getPostContent(post_id);

  // 3. Tạo session với context bài viết
  const session = conv.get(sender_id);
  // Lưu postContext = post_id để AI biết đang nói về bài nào
  session.postContext = post_id;
  session.name = fullName; // lưu họ tên đầy đủ

  // 4. Xây tin nhắn mở đầu dựa trên bài viết
  const userContext = `Tôi vừa xem bài viết của bạn và bình luận: "${message}"`;
  session.history.push({ role: 'user', content: userContext });

  const welcomeReply = await callOpenAI(session.history, post_id, false, fullName);

  session.history.push({ role: 'assistant', content: welcomeReply });
  conv.update(sender_id, session);

  // 5. Gửi DM
  await sendMessage(sender_id, welcomeReply);
  console.log(`✅ Đã gửi DM cho ${sender_name}`);
}

module.exports = { handleComment };
