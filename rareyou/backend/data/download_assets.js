const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const publicImgDir = 'c:/Users/sarth/Desktop/reverse/rareyou/backend/public/images';
if (!fs.existsSync(publicImgDir)) {
  fs.mkdirSync(publicImgDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(false);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    });
    req.on('error', (err) => {
      resolve(false);
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function run() {
  console.log('Downloading key brand assets...');
  
  // 1. Logo
  const logoUrl = 'https://rareyou.com/cdn/shop/files/Asset_2.png?v=1686718921&width=360';
  const logoDest = path.join(publicImgDir, 'rareyou-logo.png');
  const logoOk = await downloadFile(logoUrl, logoDest);
  console.log('Logo downloaded:', logoOk);

  // 2. Hero banners
  const banners = [
    { name: 'banner-slide-1.jpg', url: 'https://rareyou.com/cdn/shop/files/2_7b0abea7-3207-4641-834c-e75272f58967.jpg?v=1751978800' },
    { name: 'banner-slide-2.jpg', url: 'https://rareyou.com/cdn/shop/files/4_fbb4b9db-9712-4e8b-9ba9-4fdaaefeeee5.jpg?v=1751978800' },
    { name: 'tile-forever-flower.png', url: 'https://rareyou.com/cdn/shop/files/Forever-flowers.png?v=1753262178' },
    { name: 'tile-accessories.png', url: 'https://rareyou.com/cdn/shop/files/Accessories.png?v=1753262198' },
    { name: 'tile-clothing.png', url: 'https://rareyou.com/cdn/shop/files/Clothing.png?v=1753262214' }
  ];

  for (const b of banners) {
    const dest = path.join(publicImgDir, b.name);
    const ok = await downloadFile(b.url, dest);
    console.log(`Banner ${b.name}: ${ok ? 'Success' : 'Failed'}`);
  }

  // 3. Download product images for top 40 products
  const products = require('./products.json');
  console.log(`Downloading images for first 50 products...`);
  let downloadedCount = 0;
  for (let i = 0; i < Math.min(products.length, 50); i++) {
    const p = products[i];
    if (!p.image) continue;
    const ext = p.image.includes('.png') ? '.png' : '.jpg';
    const filename = `prod-${p.handle}${ext}`;
    const dest = path.join(publicImgDir, filename);
    const ok = await downloadFile(p.image, dest);
    if (ok) {
      downloadedCount++;
      // Set localImage field
      p.localImage = `/images/${filename}`;
    }
  }
  console.log(`Downloaded ${downloadedCount} product images successfully!`);

  // Write updated products.json
  fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/products.json', JSON.stringify(products, null, 2), 'utf8');
}

run();

