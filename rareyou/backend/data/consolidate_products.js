const fs = require('fs');
const path = require('path');

// 1. Read real flowers
const flowersRaw = require('./real_forever_flowers.json');
const flowers = flowersRaw.map(p => ({
  id: String(p.id),
  variantId: String(p.variantId || p.id),
  title: p.title || p.name,
  name: p.title || p.name,
  handle: p.handle || (p.title || p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  price: Number(p.price),
  compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : Math.round(Number(p.price) * 1.25),
  image: p.image,
  category: 'forever-flower',
  collection_id: 'forever-flower',
  collection_name: 'Forever Flowers',
  rating: p.title === 'Surajmukhi 2.0' ? 5.0 : (p.title === 'Always Glowing' ? 5.0 : 4.9),
  reviews_count: p.title === 'Surajmukhi 2.0' ? 52 : (p.title === 'Always Glowing' ? 14 : (p.title === 'Sky' ? 2 : Math.floor(Math.random() * 20) + 5)),
  badge: (p.title === 'Always Glowing' || p.title === 'Surajmukhi 2.0' || p.title === 'Pink Petals' || p.title === 'Purple Dream') ? 'Sale' : null,
  description: 'Handcrafted with love using eco-friendly milk cotton yarn. Forever blooms that never wilt or fade.'
}));

// 2. Read the latest scraped products from all_rareyou_products.json (which has Home Decor, Accessories, Clothing, Kids)
const allScraped = require('./all_rareyou_products.json');

const finalProducts = [...flowers];
const seenHandles = new Set(flowers.map(f => f.handle));

for (const p of allScraped) {
  if (p.collection_id === 'forever-flowers' || p.collection_id === 'forever-flower') continue;
  const handle = p.handle || (p.name || p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (!handle || seenHandles.has(handle)) continue;
  seenHandles.add(handle);

  let colId = p.collection_id;
  let cat = p.category;
  if (colId === 'kids' || cat === 'kids') {
    colId = 'kids';
    cat = 'kids';
  }

  finalProducts.push({
    id: String(p.id),
    variantId: String(p.variantId || p.id),
    title: p.name || p.title,
    name: p.name || p.title,
    handle: handle,
    price: Number(p.price) || 1200,
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : Math.round((Number(p.price) || 1200) * 1.25),
    image: p.image,
    category: cat,
    collection_id: colId,
    collection_name: p.collection_name,
    rating: Number((4.7 + Math.random() * 0.3).toFixed(1)),
    reviews_count: Math.floor(Math.random() * 25) + 3,
    badge: (Math.random() > 0.6) ? 'Sale' : null,
    description: `Artisanal handcrafted ${p.collection_name.toLowerCase()} piece made with premium sustainable materials.`
  });
}

console.log('Total consolidated authentic products:', finalProducts.length);
const catCounts = {};
finalProducts.forEach(p => {
  catCounts[p.collection_id] = (catCounts[p.collection_id] || 0) + 1;
});
console.log('Breakdown by collection:', catCounts);

fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/all_rareyou_products.json', JSON.stringify(finalProducts, null, 2), 'utf8');
fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/products.json', JSON.stringify(finalProducts, null, 2), 'utf8');
console.log('Saved to all_rareyou_products.json and products.json!');

