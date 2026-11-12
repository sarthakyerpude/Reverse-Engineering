const https = require('https');
const fs = require('fs');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching /collections/swings...');
  const html = await fetchPage('https://rareyou.com/collections/swings');
  fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_swings.html', html, 'utf8');
  console.log('Saved collection_swings.html, length:', html.length);
  
  // Extract variants
  const marker = 'productVariants:';
  let idx = 0;
  const swingsProducts = [];
  while ((idx = html.indexOf(marker, idx)) !== -1) {
    const start = html.indexOf('[', idx);
    if (start === -1) break;
    let depth = 0;
    let end = -1;
    for (let i = start; i < html.length; i++) {
      if (html[i] === '[') depth++;
      else if (html[i] === ']') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end !== -1) {
      try {
        const jsonStr = html.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(item => {
            swingsProducts.push({
              id: String(item.product_id || item.id),
              variantId: String(item.id),
              name: item.product_title || item.title,
              price: Math.round(Number(item.price) / 100),
              compare_at_price: item.compare_at_price ? Math.round(Number(item.compare_at_price) / 100) : null,
              url: item.product_url || '',
              handle: item.product_handle || (item.product_url ? item.product_url.replace('/products/', '') : ''),
              image: item.featured_image ? (item.featured_image.src.startsWith('//') ? 'https:' + item.featured_image.src : item.featured_image.src) : '',
              category: 'kids',
              collection_id: 'kids',
              collection_name: 'Kids'
            });
          });
        }
      } catch (err) {
        console.error('JSON parse error:', err.message);
      }
    }
    idx += marker.length;
  }
  
  console.log('Found swings products:', swingsProducts.length);
  // deduplicate by id
  const unique = [];
  const seen = new Set();
  for (const p of swingsProducts) {
    if (!seen.has(p.id) && p.name) {
      seen.add(p.id);
      unique.push(p);
    }
  }
  console.log('Unique swings products:', unique.length);
  fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/swings_products.json', JSON.stringify(unique, null, 2), 'utf8');
}

run();

