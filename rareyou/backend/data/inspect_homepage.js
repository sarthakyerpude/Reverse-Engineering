const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/homepage_raw.html', 'utf8');

// 1. Sections present on homepage
const sections = [...html.matchAll(/id="shopify-section-([^"]+)"/g)].map(m => m[1]);
console.log('Homepage Sections:', sections);

// 2. Banner and image sources
const banners = [...html.matchAll(/<div[^>]*class="[^"]*banner[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];
console.log('Banners found:', banners.length);

// 3. Featured collections or cards
const headings = [...html.matchAll(/<h2[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('Headings:', headings);

// 4. Logo image or text
const logoMatches = [...html.matchAll(/class="[^"]*header__heading[^"]*"[^>]*>([\s\S]*?)<\/a>/gi)];
logoMatches.forEach(m => console.log('Logo markup:', m[1].trim()));

