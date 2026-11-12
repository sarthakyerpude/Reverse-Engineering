const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const publicImgDir = 'c:/Users/sarth/Desktop/reverse/rareyou/backend/public/images';
const products = require('./products.json');

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        return downloadFile(res.headers.location, dest).then(resolve);
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
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function run() {
  console.log(`Checking ${products.length} products...`);
  let updated = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const ext = (p.image && p.image.includes('.png')) ? '.png' : '.jpg';
    const filename = `prod-${p.handle}${ext}`;
    const dest = path.join(publicImgDir, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      p.localImage = `/images/${filename}`;
    } else if (p.image) {
      console.log(`[${i+1}/${products.length}] Downloading ${p.handle}...`);
      const ok = await downloadFile(p.image, dest);
      if (ok && fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
        p.localImage = `/images/${filename}`;
        updated++;
      }
    }
  }

  console.log(`Finished! Total local images assigned: ${products.filter(p => p.localImage).length}`);
  fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/products.json', JSON.stringify(products, null, 2), 'utf8');
}

run();

