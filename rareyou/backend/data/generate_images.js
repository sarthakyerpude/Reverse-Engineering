const fs = require('fs');
const path = require('path');

const p = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
const c = JSON.parse(fs.readFileSync(path.join(__dirname, 'collections.json'), 'utf8'));

const imgDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

function generateArtisticSvg(title, category, color, secondaryColor, isSecondary) {
  const subtitle = isSecondary ? 'Artisanal Studio Detail' : 'Handcrafted by Rare You Artisans';
  
  let iconSvg = '';
  if (category === 'clothing') {
    iconSvg = `
      <path d="M260,180 L340,180 L380,240 L340,260 L330,220 L330,420 L270,420 L270,220 L260,260 L220,240 Z" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="300" cy="150" r="25" fill="none" stroke="${color}" stroke-width="3"/>
      <path d="M280,260 Q300,280 320,260" fill="none" stroke="${color}" stroke-width="3"/>
    `;
  } else if (category === 'swings') {
    iconSvg = `
      <line x1="220" y1="100" x2="260" y2="280" stroke="${color}" stroke-width="4" stroke-dasharray="6,4"/>
      <line x1="380" y1="100" x2="340" y2="280" stroke="${color}" stroke-width="4" stroke-dasharray="6,4"/>
      <ellipse cx="300" cy="300" rx="90" ry="35" fill="none" stroke="${color}" stroke-width="5"/>
      <path d="M210,300 C210,380 390,380 390,300" fill="none" stroke="${color}" stroke-width="4"/>
      <line x1="240" y1="350" x2="240" y2="410" stroke="${secondaryColor}" stroke-width="3"/>
      <line x1="300" y1="360" x2="300" y2="420" stroke="${secondaryColor}" stroke-width="3"/>
      <line x1="360" y1="350" x2="360" y2="410" stroke="${secondaryColor}" stroke-width="3"/>
    `;
  } else if (category === 'home-decor') {
    iconSvg = `
      <circle cx="300" cy="270" r="35" fill="#D4A373" opacity="0.9"/>
      <circle cx="300" cy="270" r="22" fill="#5A3825"/>
      <g stroke="${color}" stroke-width="4" fill="none">
        <path d="M300,210 Q300,190 300,180"/>
        <path d="M300,330 Q300,350 300,360"/>
        <path d="M240,270 Q220,270 210,270"/>
        <path d="M360,270 Q380,270 390,270"/>
        <path d="M255,225 Q240,210 235,205"/>
        <path d="M345,315 Q360,330 365,335"/>
        <path d="M255,315 Q240,330 235,335"/>
        <path d="M345,225 Q360,210 365,205"/>
      </g>
      <path d="M230,370 C270,390 330,390 370,370" stroke="${secondaryColor}" stroke-width="4" fill="none" stroke-dasharray="5,3"/>
    `;
  } else if (category === 'forever-flower') {
    iconSvg = `
      <path d="M300,430 Q300,340 300,260" stroke="#4A5844" stroke-width="5" fill="none"/>
      <path d="M300,340 Q260,320 250,330 Q280,360 300,345" fill="#6B7F64" opacity="0.8"/>
      <circle cx="300" cy="230" r="40" fill="none" stroke="${color}" stroke-width="5"/>
      <circle cx="300" cy="230" r="20" fill="${secondaryColor}" opacity="0.85"/>
      <circle cx="270" cy="210" r="25" fill="${color}" opacity="0.6"/>
      <circle cx="330" cy="210" r="25" fill="${color}" opacity="0.6"/>
      <circle cx="300" cy="180" r="25" fill="${color}" opacity="0.6"/>
    `;
  } else {
    // Plushies & Bags
    iconSvg = `
      <ellipse cx="300" cy="310" rx="60" ry="70" fill="none" stroke="${color}" stroke-width="4"/>
      <circle cx="300" cy="200" r="45" fill="none" stroke="${color}" stroke-width="4"/>
      <circle cx="270" cy="150" r="18" fill="none" stroke="${secondaryColor}" stroke-width="3"/>
      <circle cx="330" cy="150" r="18" fill="none" stroke="${secondaryColor}" stroke-width="3"/>
      <circle cx="285" cy="195" r="4" fill="#222"/>
      <circle cx="315" cy="195" r="4" fill="#222"/>
      <ellipse cx="300" cy="215" rx="10" ry="7" fill="${secondaryColor}"/>
    `;
  }

  const safeCategory = (category || 'Lifestyle').replace('-', ' ').toUpperCase();
  const safeTitle = title.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF8F5" />
      <stop offset="50%" stop-color="#F3EEEA" />
      <stop offset="100%" stop-color="#EBE4DC" />
    </linearGradient>
    <radialGradient id="haloGrad" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${color}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="600" height="750" fill="url(#bgGrad)"/>
  <rect width="600" height="750" fill="url(#haloGrad)"/>

  <rect x="20" y="20" width="560" height="710" fill="none" stroke="#E5DFD7" stroke-width="1.5" rx="4"/>
  <rect x="28" y="28" width="544" height="694" fill="none" stroke="#F5EFE6" stroke-width="1" rx="2"/>

  <text x="300" y="65" font-family="'Montserrat', sans-serif" font-size="11" font-weight="600" letter-spacing="4" fill="#8C827A" text-anchor="middle">RARE YOU • STUDIO FARIDABAD</text>
  <line x1="230" y1="80" x2="370" y2="80" stroke="#C47D68" stroke-width="1.5" stroke-linecap="round"/>

  <g transform="translate(0, 30)">
    ${iconSvg}
  </g>

  <rect x="45" y="540" width="510" height="155" fill="#FFFFFF" fill-opacity="0.9" rx="8" stroke="#EDE7DF" stroke-width="1"/>
  
  <text x="300" y="580" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="${secondaryColor}" text-anchor="middle">${safeCategory}</text>
  
  <text x="300" y="615" font-family="'Montserrat', serif" font-size="20" font-weight="600" fill="#23211E" text-anchor="middle">${safeTitle}</text>
  
  <text x="300" y="645" font-family="'Montserrat', sans-serif" font-size="12" font-weight="400" fill="#6E6862" text-anchor="middle">${subtitle}</text>

  <g transform="translate(300, 672)">
    <circle cx="-40" cy="0" r="3" fill="#C47D68"/>
    <circle cx="-20" cy="0" r="3" fill="#4A5844"/>
    <circle cx="0" cy="0" r="4" fill="${color}"/>
    <circle cx="20" cy="0" r="3" fill="#D4A373"/>
    <circle cx="40" cy="0" r="3" fill="#8C827A"/>
  </g>
</svg>`;
}

const categoryColors = {
  'clothing': { primary: '#4A5844', secondary: '#C47D68' },
  'swings': { primary: '#7C6853', secondary: '#4A5844' },
  'home-decor': { primary: '#D4A373', secondary: '#8B5A2B' },
  'forever-flower': { primary: '#C47D68', secondary: '#4A5844' },
  'accessories-plushies': { primary: '#E09F67', secondary: '#3D5A80' }
};

let count = 0;
p.forEach(prod => {
  const cInfo = categoryColors[prod.category] || { primary: '#4A5844', secondary: '#C47D68' };
  prod.images.forEach((imgUrl, idx) => {
    const filename = imgUrl.replace('http://localhost:5000/images/', '');
    const filepath = path.join(imgDir, filename);
    const svgContent = generateArtisticSvg(prod.name, prod.category, cInfo.primary, cInfo.secondary, idx > 0);
    fs.writeFileSync(filepath, svgContent, 'utf8');
    count++;
  });
});

console.log('Successfully generated', count, 'product images in public/images');

