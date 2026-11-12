const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/homepage_raw.html', 'utf8');

const slideIdx = html.indexOf('slideshow_aWWMny');
if (slideIdx !== -1) {
  const slideHtml = html.substring(slideIdx, slideIdx + 15000);
  const imgs = [...new Set(slideHtml.match(/\/\/rareyou\.com\/cdn\/shop\/files\/[^"?\s]+\.(jpg|jpeg|png|webp)/gi) || [])];
  console.log('Slideshow Images:', imgs);
  const titles = [...slideHtml.matchAll(/<h2[^>]*class="[^"]*banner__heading[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Slideshow Headings:', titles);
  const links = [...slideHtml.matchAll(/<a[^>]*class="[^"]*button[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
  console.log('Slideshow Buttons:', links);
}

