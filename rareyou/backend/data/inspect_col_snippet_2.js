const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/homepage_raw.html', 'utf8');

const colIdx = html.indexOf('collection_list_3AQb6m');
if (colIdx !== -1) {
  console.log(html.substring(colIdx + 1500, colIdx + 4500));
}

