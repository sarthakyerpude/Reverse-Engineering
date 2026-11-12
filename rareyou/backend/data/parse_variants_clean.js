const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_forever_flower.html', 'utf8');

const startTag = 'productVariants\\":[';
const start = html.indexOf(startTag);
if (start !== -1) {
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

  if (end !== -1) {
    const rawArrayStr = html.substring(arrayStart, end).replace(/\\"/g, '"').replace(/\\\//g, '/');
    const variants = JSON.parse(rawArrayStr);
    console.log('Total real products in Forever Flower:', variants.length);
    
    const cleanList = variants.map(v => ({
      id: v.product?.id || v.id,
      variantId: v.id,
      title: v.product?.title,
      price: v.price?.amount,
      compare_at_price: Math.round((v.price?.amount || 1000) * 1.25),
      url: v.product?.url,
      handle: v.product?.url?.split('/').pop(),
      image: v.image?.src ? (v.image.src.startsWith('//') ? 'https:' + v.image.src : v.image.src) : null,
      category: 'forever-flower',
      collection_id: 'forever-flower'
    }));

    cleanList.slice(0, 10).forEach((p, idx) => {
      console.log(`${idx+1}. ${p.title} | Rs. ${p.price} | Image: ${p.image}`);
    });

    fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/real_forever_flowers.json', JSON.stringify(cleanList, null, 2), 'utf8');
  }
}

