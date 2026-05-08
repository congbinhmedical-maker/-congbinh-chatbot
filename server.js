require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const { handleMessage } = require('./handlers/message');
const { handleComment } = require('./handlers/comment');
const { setHumanTakeover } = require('./services/conversation');

const BOT_APP_ID = process.env.FACEBOOK_APP_ID || '1210967194135072';

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'congbinh2026';
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

// Health check
app.get('/', (req, res) => res.send('✅ Công Bình Medical Bot đang chạy'));

// Facebook webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Receive Facebook events
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Phải trả 200 ngay, xử lý sau

  const body = req.body;
  if (body.object !== 'page') return;

  for (const entry of body.entry) {
    // Tin nhắn Messenger
    if (entry.messaging) {
      for (const event of entry.messaging) {
        // Echo = Page gửi đi — phân biệt người thật vs bot
        if (event.message?.is_echo) {
          const sentByBot = String(event.message.app_id) === String(BOT_APP_ID);
          const recipientId = event.recipient?.id;
          if (!sentByBot && recipientId) {
            // Người thật đang trả lời → bật human takeover
            setHumanTakeover(recipientId, true);
            console.log(`👤 Người thật đang trực — tắt bot cho ${recipientId}`);
          }
          continue;
        }
        // Tin nhắn từ khách
        if (event.message) {
          await handleMessage(event).catch(e => console.error('Message error:', e.message));
        }
      }
    }

    // Bình luận trên bài viết
    if (entry.changes) {
      for (const change of entry.changes) {
        const v = change.value;
        if (change.field === 'feed' && v.item === 'comment' && v.verb === 'add') {
          // Bỏ qua comment của chính page
          if (v.from?.id === PAGE_ID) continue;
          // Bỏ qua reply comment (parent_id khác post_id)
          if (v.parent_id && v.parent_id !== v.post_id) continue;
          await handleComment(v).catch(e => console.error('Comment error:', e.message));
        }
      }
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🤖 Bot chạy tại port ${PORT}`));
