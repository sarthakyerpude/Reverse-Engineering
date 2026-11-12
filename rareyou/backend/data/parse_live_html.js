const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/collection_forever_flower.html', 'utf8');

// 1. Check Announcement Bar
const announceMatch = html.match(/<div[^>]*class="[^"]*announcement-bar[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
if (announceMatch) {
  console.log('Announcement Bar Text:', announceMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

// 2. Check Logo
const logoMatch = html.match(/<img[^>]*class="[^"]*header__heading-logo[^"]*"[^>]*src="([^"]*)"/i);
console.log('Logo src:', logoMatch ? logoMatch[1] : 'not found');
if (!logoMatch) {
  const logoTextMatch = html.match(/<span[^>]*class="[^"]*h2[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  console.log('Logo text:', logoTextMatch ? logoTextMatch[1].trim() : 'none');
}

// 3. Navigation Links
const navRegex = /<a[^>]*class="[^"]*header__menu-item[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
console.log('\n--- NAV MENU ITEMS ---');
while ((match = navRegex.exec(html)) !== null) {
  const url = match[1];
  const text = match[2].replace(/<[^>]+>/g, '').trim();
  console.log(text, '->', url);
}

// 4. Products Extraction (Cards)
console.log('\n--- EXTRACTING PRODUCT CARDS ---');
const cardRegex = /<li[^>]*class="[^"]*grid__item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
const products = [];
while ((match = cardRegex.exec(html)) !== null) {
  const cardHtml = match[1];
  
  // Title & Link
  const titleMatch = cardHtml.match(/<a[^>]*class="[^"]*full-unstyled-link[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
  if (!titleMatch) continue;
  
  const link = titleMatch[1].trim();
  const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();
  
  // Image URL
  const imgMatch = cardHtml.match(/src="(\/\/rareyou\.com\/cdn\/shop\/files\/[^"?\s]+)/i) ||
                   cardHtml.match(/srcset="(\/\/rareyou\.com\/cdn\/shop\/files\/[^"?\s]+)/i);
  
  // Price
  const priceMatch = cardHtml.match(/class="[^"]*price-item--regular[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  const salePriceMatch = cardHtml.match(/class="[^"]*price-item--sale[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  
  const regularPrice = priceMatch ? priceMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  const salePrice = salePriceMatch ? salePriceMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  
  // Rating badge
  const ratingMatch = cardHtml.match(/rating-count[^>]*>([\s\S]*?)<\/span>/i);
  
  // Sale badge
  const isSale = cardHtml.includes('badge--bottom-left') || cardHtml.includes('Sale') || cardHtml.includes('badge price__badge-sale');

  products.push({
    title,
    link,
    handle: link.split('/').pop().split('?')[0],
    image: imgMatch ? 'https:' + imgMatch[1] : null,
    regularPrice,
    salePrice: salePrice || regularPrice,
    isSale: !!isSale,
    rating: ratingMatch ? ratingMatch[1].trim() : ''
  });
}

console.log('Total product cards parsed:', products.length);
console.log('First 6 products:', JSON.stringify(products.slice(0, 6), null, 2));
fs.writeFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/extracted_flower_products.json', JSON.stringify(products, null, 2), 'utf8');

