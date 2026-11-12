const https = require('https');
const fs = require('fs');
const path = require('path');

const collectionsToFetch = [
  { id: 'forever-flowers', path: '/collections/forever-flower', name: 'Forever Flowers' },
  { id: 'home-decor', path: '/collections/home-decor', name: 'Home Decor' },
  { id: 'accessories', path: '/collections/accessories', name: 'Accessories' },
  { id: 'clothing', path: '/collections/clothing', name: 'Clothing' },
  { id: 'kids', path: '/collections/swings', name: 'Kids' }
];

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'rareyou.com',
      path: urlPath,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    https.get(options, res => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => resolve({ status: res.statusCode, html }));
    }).on('error', reject);
  });
}

function extractVariantsFromHtml(html, colId, colName) {
  const startTag = 'productVariants\\":[';
  const start = html.indexOf(startTag);
  if (start === -1) return [];

  const arrayStart = start + startTag.length - 1;
  let depth = 0;
  let end = -1;
  for (let i = arrayStart; i < html.length; i++) {
    if (html[i] === '[') depth++;
    else if (html[i] === ']') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) return [];

  try {
    const rawArrayStr = html.substring(arrayStart, end).replace(/\\"/g, '"').replace(/\\\//g, '/');
    const variants = JSON.parse(rawArrayStr);
    return variants.map(v => ({
      id: v.product?.id || v.id,
      variantId: v.id,
      name: v.product?.title,
      price: v.price?.amount,
      compare_at_price: Math.round((v.price?.amount || 1000) * 1.25),
      url: v.product?.url,
      handle: v.product?.url?.split('/').pop(),
      image: v.image?.src ? (v.image.src.startsWith('//') ? 'https:' + v.image.src : v.image.src) : null,
      category: colId,
      collection_id: colId,
      collection_name: colName
    }));
  } catch (e) {
    console.error(`Error parsing ${colId}:`, e.message);
    return [];
  }
}

async function run() {
  const allProducts = [];
  const seenTitles = new Set();

  for (const col of collectionsToFetch) {
    console.log(`Fetching ${col.name} (${col.path})...`);
    try {
      const res = await fetchPage(col.path);
      console.log(`Status ${res.status}, length: ${res.html.length}`);
      const prods = extractVariantsFromHtml(res.html, col.id, col.name);
      console.log(`Found ${prods.length} products in ${col.name}`);
      for (const p of prods) {
        if (!seenTitles.has(p.name)) {
          seenTitles.add(p.name);
          allProducts.push(p);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${col.name}:`, err.message);
    }
  }

  console.log(`\nTOTAL UNIQUE PRODUCTS ACROSS ALL 5 COLLECTIONS: ${allProducts.length}`);
  fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/all_rareyou_products.json', JSON.stringify(allProducts, null, 2), 'utf8');
}

run();
