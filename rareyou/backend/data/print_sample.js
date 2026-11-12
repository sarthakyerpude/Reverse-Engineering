const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_forever_flower.html', 'utf8');

const idx = html.indexOf('Bumble in Blue');
console.log(html.substring(idx - 100, idx + 350));

