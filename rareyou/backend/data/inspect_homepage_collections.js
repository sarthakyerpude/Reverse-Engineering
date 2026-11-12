const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/homepage_raw.html', 'utf8');

const colIdx = html.indexOf('collection_list_3AQb6m');
if (colIdx !== -1) {
  const colHtml = html.substring(colIdx, colIdx + 12000);
  const cards = [...colHtml.matchAll(/<li[^>]*class="[^"]*collection-list__item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi)];
  console.log('Collection cards count:', cards.length);
  cards.forEach((c, idx) => {
    const titleMatch = c[1].match(/<h3[^>]*class="[^"]*card__heading[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'no title';
    const linkMatch = c[1].match(/href="([^"]*)"/i);
    const imgMatch = c[1].match(/src="(\/\/rareyou\.com\/cdn\/shop\/files\/[^"?\s]+)/i);
    console.log(`${idx+1}. ${title} -> ${linkMatch ? linkMatch[1] : ''} | Img: ${imgMatch ? 'https:' + imgMatch[1] : 'none'}`);
  });
}

