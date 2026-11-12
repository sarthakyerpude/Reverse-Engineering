const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_forever_flower.html', 'utf8');

// Extract collection_viewed JSON
const match = html.match(/\[\\"collection_viewed\\",(\{[\s\S]*?\})\]/);
if (match) {
  const unescaped = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  try {
    const colData = JSON.parse(unescaped);
    console.log('Collection Title:', colData.collection?.title);
    console.log('Product count in variant list:', colData.collection?.productVariants?.length);
    fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/real_flower_products.json', JSON.stringify(colData.collection.productVariants, null, 2));
    
    colData.collection.productVariants.slice(0, 8).forEach((v, i) => {
      console.log(`${i+1}. ${v.product.title} - Rs. ${v.price.amount} - Img: ${v.image?.src}`);
    });
  } catch (e) {
    console.error('Parse error:', e.message);
  }
} else {
  console.log('collection_viewed not matched directly, searching alternative regex');
  const startIdx = html.indexOf('"collection_viewed"');
  if (startIdx !== -1) {
    const slice = html.substring(startIdx - 10, startIdx + 5000);
    console.log('Raw slice:', slice.slice(0, 500));
  }
}

