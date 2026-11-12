const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'rareyou.com',
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  }
};

https.get(options, res => {
  console.log('Homepage status:', res.statusCode);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/homepage_raw.html', html, 'utf8');
    console.log('Saved homepage_raw.html with length', html.length);
  });
}).on('error', e => console.error(e));

