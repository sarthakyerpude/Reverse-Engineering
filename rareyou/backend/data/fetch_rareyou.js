const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'rareyou.com',
  path: '/collections/forever-flower',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  }
};

https.get(options, res => {
  console.log('Status:', res.statusCode);
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('HTML length:', html.length);
    fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_forever_flower.html', html, 'utf8');
    const imgMatches = [...new Set(html.match(/\/\/rareyou\.com\/cdn\/shop\/files\/[^\s"'<>]+/g) || [])];
    console.log('CDN Images found:', imgMatches.length);
    console.log(imgMatches.slice(0, 10));
    const prodMatches = [...new Set(html.match(/\/products\/[a-zA-Z0-9_-]+/g) || [])];
    console.log('Products found:', prodMatches.length);
    console.log(prodMatches.slice(0, 15));
  });
}).on('error', e => console.error(e));

