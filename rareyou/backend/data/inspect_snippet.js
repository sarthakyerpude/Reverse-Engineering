const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_forever_flower.html', 'utf8');

// Find occurrences of "Bumble in Blue"
const idx = html.indexOf('Bumble in Blue');
console.log('Index of Bumble in Blue:', idx);
if (idx !== -1) {
  console.log('Snippet around Bumble in Blue:\n', html.substring(idx - 400, idx + 400));
}

// Find occurrences of "Forever Flowers"
const navIdx = html.indexOf('Forever Flowers');
console.log('Index of Forever Flowers:', navIdx);
if (navIdx !== -1) {
  console.log('Snippet around Forever Flowers:\n', html.substring(navIdx - 200, navIdx + 300));
}

