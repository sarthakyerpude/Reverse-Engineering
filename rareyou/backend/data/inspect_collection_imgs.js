const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/homepage_raw.html', 'utf8');

const colIdx = html.indexOf('collection_list_3AQb6m');
if (colIdx !== -1) {
  const colHtml = html.substring(colIdx, colIdx + 12000);
  const imgs = [...new Set(colHtml.match(/\/\/rareyou\.com\/cdn\/shop\/files\/[^"?\s]+\.(jpg|jpeg|png|webp)/gi) || [])];
  console.log('Collection section images:', imgs);
}

