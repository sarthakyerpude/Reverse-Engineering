const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_forever_flower.html', 'utf8');

// Regex for individual variant objects in the tracking data
const regex = /\{\\"price\\":\{\\"amount\\":([0-9.]+),\\"currencyCode\\":\\"INR\\"\},\\"product\\":\{\\"title\\":\\"([^\\"]+)\\",\\"vendor\\":\\"[^\\"]*\\",\\"id\\":\\"([0-9]+)\\",\\"untranslatedTitle\\":\\"[^\\"]*\\",\\"url\\":\\"([^\\"]+)\\"[^\}]*\},\\"id\\":\\"([0-9]+)\\",\\"image\\":\{\\"src\\":\\"([^\\"]+)\\"/g;

const products = [];
const seen = new Set();
let m;

while ((m = regex.exec(html)) !== null) {
  const price = parseFloat(m[1]);
  const title = m[2];
  const prodId = m[3];
  const url = m[4].replace(/\\/g, '');
  const variantId = m[5];
  const imgSrc = m[6].replace(/\\/g, '');

  if (!seen.has(title)) {
    seen.add(title);
    products.push({
      id: prodId,
      variantId,
      title,
      price,
      url,
      handle: url.split('/').pop(),
      image: imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc
    });
  }
}

console.log('Successfully extracted', products.length, 'real products from Forever Flower collection!');
products.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. [${p.title}] - Rs. ${p.price} | ${p.handle} | ${p.image}`);
});

fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/rareyou_flowers.json', JSON.stringify(products, null, 2), 'utf8');

