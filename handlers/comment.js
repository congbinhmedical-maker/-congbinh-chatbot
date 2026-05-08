const { replyToComment, sendMessage, getPostContent } = require('../services/facebook');
const { callOpenAI } = require('../services/openai');
const conv = require('../services/conversation');

async function handleComment(data) {
  const { post_id, comment_id, sender_id, sender_name, message } = data;

  // Tên thân mật — lấy họ (tên gọi kiểu Việt Nam)
  const fullName = sender_name || '';
  const firstName = fullName.trim().split(' ').pop() || 'bạn';

  console.log(`💬 Comment từ ${sender_name} (${sender_id}): ${message}`);

  // 1. Reply ngay vào comment để mời vào DM
  const commentReply = `${firstName} ơi! Lâm vừa nhắn tin cho ${firstName.toLowerCase()} rồi nhé 😊 Kiểm tra hộp thư giúp Lâm với ạ!`;
  await replyToComment(comment_id, commentReply);

  // 2. Lấy nội dung bài viết để bot hiểu context
  const postContent = await getPostContent(post_id);

  // 3. Tạo session với context bài viết
  const session = conv.get(sender_id);
  // Lưu postContext = post_id để AI biết đang nói về bài nào
  session.postContext = post_id;
  session.name = firstName;

  // 4. Xây tin nhắn mở đầu dựa trên bài viết
  const userContext = `Tôi vừa xem bài viết của bạn và bình luận: "${message}"`;
  session.history.push({ role: 'user', content: userContext });

  const welcomeReply = await callOpenAI(session.history, post_id, false);

  session.history.push({ role: 'assistant', content: welcomeReply });
  conv.update(sender_id, session);

  // 5. Gửi DM
  await sendMessage(sender_id, welcomeReply);
  console.log(`✅ Đã gửi DM cho ${sender_name}`);
}

module.exports = { handleComment };
