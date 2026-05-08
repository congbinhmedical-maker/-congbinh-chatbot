const axios = require('axios');

const TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v19.0';

async function sendMessage(recipientId, text) {
  try {
    await axios.post(`${API}/me/messages`, {
      recipient: { id: recipientId },
      message: { text },
      messaging_type: 'RESPONSE'
    }, { params: { access_token: TOKEN } });
  } catch (err) {
    console.error('❌ Gửi tin nhắn lỗi:', err.response?.data?.error?.message || err.message);
  }
}

async function replyToComment(commentId, message) {
  try {
    await axios.post(`${API}/${commentId}/comments`, { message }, {
      params: { access_token: TOKEN }
    });
  } catch (err) {
    console.error('❌ Reply comment lỗi:', err.response?.data?.error?.message || err.message);
  }
}

async function getPostContent(postId) {
  try {
    const res = await axios.get(`${API}/${postId}`, {
      params: { fields: 'message,story', access_token: TOKEN }
    });
    return res.data.message || res.data.story || '';
  } catch {
    return '';
  }
}

module.exports = { sendMessage, replyToComment, getPostContent };
