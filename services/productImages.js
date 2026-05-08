// Map từ khóa sản phẩm → URL ảnh trên congbinhmedical.vn
const PRODUCT_IMAGES = {
  'sl8900':     'https://congbinhmedical.vn/wp-content/uploads/2025/02/Mau-website-33-600x600.jpg',
  'sl8600':     'https://congbinhmedical.vn/wp-content/uploads/2025/10/Mau-website-3-600x600.jpg',
  'kj917':      'https://congbinhmedical.vn/wp-content/uploads/2025/10/Mau-website-4-600x600.jpg',
  'leray':      'https://congbinhmedical.vn/wp-content/uploads/2025/02/xquang-sung-bia-1-600x600.jpg',
  'xquang_cay': 'https://congbinhmedical.vn/wp-content/uploads/2025/02/xquang-cay123-1-600x600.jpg',
  'sensor':     'https://congbinhmedical.vn/wp-content/uploads/2025/02/sensor-dep-1-600x600.jpg',
  'caovoi_b5':  'https://congbinhmedical.vn/wp-content/uploads/2025/02/Mau-website-2-600x600.jpg',
  'noi_hap':    'https://congbinhmedical.vn/wp-content/uploads/2025/02/Mau-website-13-600x600.jpg',
  'may_nen_khi':'https://congbinhmedical.vn/wp-content/uploads/2025/10/8bde9d64-6b23-417c-be0f-c9b47288a612-600x600.jpg',
  'may_hut_vc30':'https://congbinhmedical.vn/wp-content/uploads/2025/02/may-hut-tt-2-600x597.jpg',
  'may_hut_vc60':'https://congbinhmedical.vn/wp-content/uploads/2025/10/Mau-website-1-600x600.jpg',
  'implant':    'https://congbinhmedical.vn/wp-content/uploads/2025/10/Mau-website-1-600x600.png',
  'noi_nha':    'https://congbinhmedical.vn/wp-content/uploads/2025/02/Mau-website-8-600x600.jpg',
};

// Lấy URL ảnh từ tag [IMG:key] trong response AI
function extractImageTag(text) {
  const match = text.match(/\[IMG:([\w_]+)\]/);
  if (!match) return { cleanText: text, imageKey: null };
  return {
    cleanText: text.replace(match[0], '').trim(),
    imageKey: match[1]
  };
}

function getImageUrl(key) {
  return PRODUCT_IMAGES[key] || null;
}

module.exports = { extractImageTag, getImageUrl };
