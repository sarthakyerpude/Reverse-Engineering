const fs = require('fs');
const html = fs.readFileSync('c:/Users/sarth/Desktop/reverse/rareyou/backend/data/homepage_raw.html', 'utf8');

const navStart = html.indexOf('<nav');
const navEnd = html.indexOf('</nav>', navStart);
if (navStart !== -1 && navEnd !== -1) {
  const navHtml = html.substring(navStart, navEnd + 6);
  const regex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  console.log('--- NAV LINKS ---');
  while ((match = regex.exec(navHtml)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      console.log(`${text} -> ${match[1]}`);
    }
  }
} else {
  console.log('Nav element not found, searching header...');
  const headerStart = html.indexOf('<header');
  const headerEnd = html.indexOf('</header>', headerStart);
  const headerHtml = html.substring(headerStart, headerEnd + 9);
  const regex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = regex.exec(headerHtml)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      console.log(`${text} -> ${match[1]}`);
    }
  }
}

