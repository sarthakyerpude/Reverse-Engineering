const fs = require('fs');
const path = require('path');

const products = [
  // 1. CLOTHING
  {
    id: 'prod_cloth_01',
    name: 'Cookie & Creme Dress',
    handle: 'cookie-and-creme-dress',
    collection_id: 'clothing',
    category: 'clothing',
    price: 2499,
    compare_at_price: 3199,
    badge: 'Bestseller',
    featured: true,
    rating: 4.9,
    review_count: 38,
    inventory: 15,
    images: [
      'http://localhost:5000/images/dress_cookie_creme_1.jpg',
      'http://localhost:5000/images/dress_cookie_creme_2.jpg'
    ],
    short_description: 'Pure breathable cotton artisanal midi dress featuring a classic cookie & creme dual-tone palette and delicate mother-of-pearl buttons.',
    description: 'The Cookie & Creme Dress embodies understated elegance. Hand-tailored by our master women artisans in Faridabad, it features 100% fine-spun breathable cotton, a flattering A-line silhouette, concealed side pockets, and delicate coconut shell button detailing along the bodice. Ideal for brunch, gallery visits, or quiet afternoons in the sun.',
    specs: {
      material: '100% Hand-loomed Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'Gentle hand wash in cold water with mild detergent. Line dry in shade.',
      fit: 'Relaxed A-Line Silhouette',
      pockets: 'Yes, dual side seam pockets',
      custom_sizing: true
    },
    variants: [
      { id: 'var_cc_xs', title: 'XS (Bust 32")', price: 2499, sku: 'RY-DR-CC-XS', inventory: 3 },
      { id: 'var_cc_s', title: 'S (Bust 34")', price: 2499, sku: 'RY-DR-CC-S', inventory: 5 },
      { id: 'var_cc_m', title: 'M (Bust 36")', price: 2499, sku: 'RY-DR-CC-M', inventory: 4 },
      { id: 'var_cc_l', title: 'L (Bust 38")', price: 2499, sku: 'RY-DR-CC-L', inventory: 2 },
      { id: 'var_cc_xl', title: 'XL (Bust 40")', price: 2499, sku: 'RY-DR-CC-XL', inventory: 1 }
    ],
    tags: ['dress', 'handmade', 'cotton', 'summer', 'bestseller', 'sustainable']
  },
  {
    id: 'prod_cloth_02',
    name: 'Bloom Story Floral Dress',
    handle: 'bloom-story-dress',
    collection_id: 'clothing',
    category: 'clothing',
    price: 2899,
    compare_at_price: 3499,
    badge: 'Artisan Choice',
    featured: true,
    rating: 4.8,
    review_count: 24,
    inventory: 12,
    images: [
      'http://localhost:5000/images/dress_bloom_story_1.jpg',
      'http://localhost:5000/images/dress_bloom_story_2.jpg'
    ],
    short_description: 'Whimsical tiered prairie dress adorned with delicate hand-embroidered botanical florals and puff sleeves.',
    description: 'Let your wardrobe tell a floral story. Crafted in soft mulmul cotton, this tiered dress is highlighted by subtle botanical embroidery on the sleeve cuffs and neckline. The elasticated smocked back panel ensures a comfortable, tailored fit for every body type.',
    specs: {
      material: 'Mulmul Breathable Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'Dry clean recommended for initial wash; gentle cold hand wash thereafter.',
      fit: 'Fitted smocked bodice with tiered flowing skirt',
      custom_sizing: true
    },
    variants: [
      { id: 'var_bs_xs', title: 'XS', price: 2899, sku: 'RY-DR-BS-XS', inventory: 2 },
      { id: 'var_bs_s', title: 'S', price: 2899, sku: 'RY-DR-BS-S', inventory: 4 },
      { id: 'var_bs_m', title: 'M', price: 2899, sku: 'RY-DR-BS-M', inventory: 3 },
      { id: 'var_bs_l', title: 'L', price: 2899, sku: 'RY-DR-BS-L', inventory: 2 },
      { id: 'var_bs_xl', title: 'XL', price: 2899, sku: 'RY-DR-BS-XL', inventory: 1 }
    ],
    tags: ['dress', 'floral', 'cottagecore', 'artisan', 'embroidery']
  },
  {
    id: 'prod_cloth_03',
    name: 'Rise & Shine Linen Dress',
    handle: 'rise-and-shine-dress',
    collection_id: 'clothing',
    category: 'clothing',
    price: 2299,
    compare_at_price: 2899,
    badge: 'Staff Pick',
    featured: false,
    rating: 4.7,
    review_count: 19,
    inventory: 10,
    images: [
      'http://localhost:5000/images/dress_rise_shine_1.jpg',
      'http://localhost:5000/images/dress_rise_shine_2.jpg'
    ],
    short_description: 'Sunlight marigold linen midi dress with button-down front and adjustable tie belt.',
    description: 'Infused with the joy of morning sunshine, the Rise & Shine dress is woven from natural flax linen that softens with every wash. Its earthy mustard yellow tone pairs effortlessly with handmade sandals and macrame bags.',
    specs: {
      material: '100% Pure Flax Linen',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'Machine wash delicate cold. Hang dry.',
      fit: 'Relaxed button-front shirt dress with belt',
      custom_sizing: true
    },
    variants: [
      { id: 'var_rs_xs', title: 'XS', price: 2299, sku: 'RY-DR-RS-XS', inventory: 2 },
      { id: 'var_rs_s', title: 'S', price: 2299, sku: 'RY-DR-RS-S', inventory: 3 },
      { id: 'var_rs_m', title: 'M', price: 2299, sku: 'RY-DR-RS-M', inventory: 3 },
      { id: 'var_rs_l', title: 'L', price: 2299, sku: 'RY-DR-RS-L', inventory: 1 },
      { id: 'var_rs_xl', title: 'XL', price: 2299, sku: 'RY-DR-RS-XL', inventory: 1 }
    ],
    tags: ['linen', 'sunshine', 'dress', 'summer', 'button-down']
  },
  {
    id: 'prod_cloth_04',
    name: 'Meadow Breeze Sage Dress',
    handle: 'meadow-breeze-midi',
    collection_id: 'clothing',
    category: 'clothing',
    price: 2699,
    compare_at_price: 3299,
    badge: 'Popular',
    featured: false,
    rating: 5.0,
    review_count: 14,
    inventory: 8,
    images: [
      'http://localhost:5000/images/dress_meadow_sage_1.jpg',
      'http://localhost:5000/images/dress_meadow_sage_2.jpg'
    ],
    short_description: 'Earthy sage green organic wrap dress with flutter hem and flutter sleeves.',
    description: 'A true embodiment of serene forest calmness. Handcrafted with botanical-dyed organic cotton, this wrap dress adjusts seamlessly to your waistline with inner and outer satin-finish ties.',
    specs: {
      material: 'Organic Botanical-Dyed Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'Gentle hand wash inside out with cold water.',
      fit: 'True Wrap Silhouette',
      custom_sizing: true
    },
    variants: [
      { id: 'var_mb_xs', title: 'XS', price: 2699, sku: 'RY-DR-MB-XS', inventory: 1 },
      { id: 'var_mb_s', title: 'S', price: 2699, sku: 'RY-DR-MB-S', inventory: 2 },
      { id: 'var_mb_m', title: 'M', price: 2699, sku: 'RY-DR-MB-M', inventory: 3 },
      { id: 'var_mb_l', title: 'L', price: 2699, sku: 'RY-DR-MB-L', inventory: 1 },
      { id: 'var_mb_xl', title: 'XL', price: 2699, sku: 'RY-DR-MB-XL', inventory: 1 }
    ],
    tags: ['sage', 'wrap dress', 'cotton', 'botanical']
  },
  {
    id: 'prod_cloth_05',
    name: 'Ivory Whisper Handcrafted Kurti',
    handle: 'ivory-whisper-kurti',
    collection_id: 'clothing',
    category: 'clothing',
    price: 1899,
    compare_at_price: 2499,
    badge: 'New',
    featured: false,
    rating: 4.8,
    review_count: 11,
    inventory: 14,
    images: [
      'http://localhost:5000/images/dress_ivory_whisper_1.jpg',
      'http://localhost:5000/images/dress_ivory_whisper_2.jpg'
    ],
    short_description: 'Minimalist hand-embroidered off-white tunic with side slits and delicate lace trim.',
    description: 'An essential everyday tunic handcrafted from hand-spun khadi cotton. Subtle tone-on-tone ivory thread embroidery graces the V-neckline and sleeve borders.',
    specs: {
      material: '100% Handspun Khadi Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'Cold water wash with like colors.',
      fit: 'Straight cut with 12-inch side slits',
      custom_sizing: true
    },
    variants: [
      { id: 'var_iw_xs', title: 'XS', price: 1899, sku: 'RY-DR-IW-XS', inventory: 3 },
      { id: 'var_iw_s', title: 'S', price: 1899, sku: 'RY-DR-IW-S', inventory: 4 },
      { id: 'var_iw_m', title: 'M', price: 1899, sku: 'RY-DR-IW-M', inventory: 3 },
      { id: 'var_iw_l', title: 'L', price: 1899, sku: 'RY-DR-IW-L', inventory: 2 },
      { id: 'var_iw_xl', title: 'XL', price: 1899, sku: 'RY-DR-IW-XL', inventory: 2 }
    ],
    tags: ['kurti', 'ivory', 'minimalist', 'tunic']
  },
  {
    id: 'prod_cloth_06',
    name: 'Terracotta Sun Tiered Dress',
    handle: 'terracotta-sun-dress',
    collection_id: 'clothing',
    category: 'clothing',
    price: 2599,
    compare_at_price: 3199,
    badge: '',
    featured: false,
    rating: 4.9,
    review_count: 9,
    inventory: 7,
    images: [
      'http://localhost:5000/images/dress_terracotta_1.jpg',
      'http://localhost:5000/images/dress_terracotta_2.jpg'
    ],
    short_description: 'Rich warm terracotta cotton tiered maxi dress with square neckline and gathered waist.',
    description: 'Inspired by raw earthen pottery and desert sunsets, this rich terracotta dress is made from double-gauze breathable cotton that feels like a warm hug against your skin.',
    specs: {
      material: '100% Double-Gauze Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'Hand wash cold. Do not bleach. Steam iron.',
      fit: 'Square neckline with relaxed tiered body',
      custom_sizing: true
    },
    variants: [
      { id: 'var_ts_xs', title: 'XS', price: 2599, sku: 'RY-DR-TS-XS', inventory: 1 },
      { id: 'var_ts_s', title: 'S', price: 2599, sku: 'RY-DR-TS-S', inventory: 2 },
      { id: 'var_ts_m', title: 'M', price: 2599, sku: 'RY-DR-TS-M', inventory: 2 },
      { id: 'var_ts_l', title: 'L', price: 2599, sku: 'RY-DR-TS-L', inventory: 1 },
      { id: 'var_ts_xl', title: 'XL', price: 2599, sku: 'RY-DR-TS-XL', inventory: 1 }
    ],
    tags: ['terracotta', 'tiered', 'gauze', 'earthy']
  },
  {
    id: 'prod_cloth_07',
    name: 'Lavender Dusk Cotton Dress',
    handle: 'lavender-dusk-dress',
    collection_id: 'clothing',
    category: 'clothing',
    price: 2799,
    compare_at_price: 3499,
    badge: '',
    featured: false,
    rating: 4.6,
    review_count: 8,
    inventory: 9,
    images: [
      'http://localhost:5000/images/dress_lavender_1.jpg',
      'http://localhost:5000/images/dress_lavender_2.jpg'
    ],
    short_description: 'Muted lavender artisanal maxi dress with gathered waist and wooden buttons.',
    description: 'A soothing pastel lavender dress woven from combed organic cotton. Features graceful 3/4 sleeves and a gentle flare at the hem.',
    specs: {
      material: 'Combed Organic Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'Gentle cycle cold. Dry in shade.',
      fit: 'Classic fit and flare',
      custom_sizing: true
    },
    variants: [
      { id: 'var_ld_xs', title: 'XS', price: 2799, sku: 'RY-DR-LD-XS', inventory: 2 },
      { id: 'var_ld_s', title: 'S', price: 2799, sku: 'RY-DR-LD-S', inventory: 3 },
      { id: 'var_ld_m', title: 'M', price: 2799, sku: 'RY-DR-LD-M', inventory: 2 },
      { id: 'var_ld_l', title: 'L', price: 2799, sku: 'RY-DR-LD-L', inventory: 1 },
      { id: 'var_ld_xl', title: 'XL', price: 2799, sku: 'RY-DR-LD-XL', inventory: 1 }
    ],
    tags: ['lavender', 'cotton', 'pastel', 'maxi']
  },
  {
    id: 'prod_cloth_08',
    name: 'Monochrome Petal Midi',
    handle: 'monochrome-petal-dress',
    collection_id: 'clothing',
    category: 'clothing',
    price: 2399,
    compare_at_price: 2999,
    badge: '',
    featured: false,
    rating: 4.8,
    review_count: 15,
    inventory: 11,
    images: [
      'http://localhost:5000/images/dress_monochrome_1.jpg',
      'http://localhost:5000/images/dress_monochrome_2.jpg'
    ],
    short_description: 'Hand-block printed monochrome petal dress with sash belt and side slits.',
    description: 'Handcrafted using traditional teakwood block printing techniques. Black floral botanical patterns on an off-white cotton base create a chic yet timeless aesthetic.',
    specs: {
      material: '100% Hand-Block Printed Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      wash_care: 'First wash separate. Gentle hand wash cold.',
      fit: 'Relaxed midi with tie belt',
      custom_sizing: true
    },
    variants: [
      { id: 'var_mp_xs', title: 'XS', price: 2399, sku: 'RY-DR-MP-XS', inventory: 2 },
      { id: 'var_mp_s', title: 'S', price: 2399, sku: 'RY-DR-MP-S', inventory: 3 },
      { id: 'var_mp_m', title: 'M', price: 2399, sku: 'RY-DR-MP-M', inventory: 3 },
      { id: 'var_mp_l', title: 'L', price: 2399, sku: 'RY-DR-MP-L', inventory: 2 },
      { id: 'var_mp_xl', title: 'XL', price: 2399, sku: 'RY-DR-MP-XL', inventory: 1 }
    ],
    tags: ['block-print', 'monochrome', 'dress', 'midi']
  },

  // 2. SWINGS
  {
    id: 'prod_swing_01',
    name: "Jasmine's Swing",
    handle: 'jasmines-swing',
    collection_id: 'swings',
    category: 'swings',
    price: 3899,
    compare_at_price: 4999,
    badge: 'Iconic Design',
    featured: true,
    rating: 5.0,
    review_count: 42,
    inventory: 8,
    images: [
      'http://localhost:5000/images/swing_jasmine_1.jpg',
      'http://localhost:5000/images/swing_jasmine_2.jpg'
    ],
    short_description: 'Signature hand-knotted bohemian macrame swing chair with braided tassels and tested 120 kg weight capacity.',
    description: "Our flagship creation. Jasmine's Swing is intricately woven by master artisans over 3 full days using 5mm heavy-duty natural unbleached cotton cords. Reinforced with a double-welded iron ring frame and tested up to 120 kg, it brings effortless bohemian serenity to your balcony, bedroom, or reading nook. Includes heavy-duty stainless steel ceiling anchor hardware.",
    specs: {
      weight_capacity: '120 kg (Independently Load Tested)',
      material: '100% Organic Heavy-Duty Cotton Cord + Welded Iron Frame',
      dimensions: 'Diameter: 80 cm, Total Height: 140 cm',
      hardware: 'Includes heavy-duty stainless steel carabiner and ceiling anchor bolts',
      warranty: '1 Year Structural Craftsmanship Warranty'
    },
    variants: [
      { id: 'var_js_standard', title: 'With Standard Ceiling Kit', price: 3899, sku: 'RY-SW-JS-STD', inventory: 6 },
      { id: 'var_js_deluxe', title: 'With Deluxe Swivel & Extension Chain', price: 4299, sku: 'RY-SW-JS-DLX', inventory: 2 }
    ],
    tags: ['swing', 'macrame', 'boho', 'furniture', 'home', 'handcrafted']
  },
  {
    id: 'prod_swing_02',
    name: 'Baby Swing Off-White',
    handle: 'baby-swing-off-white',
    collection_id: 'swings',
    category: 'swings',
    price: 2499,
    compare_at_price: 3199,
    badge: 'Nursery Favorite',
    featured: true,
    rating: 4.9,
    review_count: 31,
    inventory: 10,
    images: [
      'http://localhost:5000/images/swing_baby_1.jpg',
      'http://localhost:5000/images/swing_baby_2.jpg'
    ],
    short_description: 'Gentle organic macrame cradle swing for infants and toddlers (6 months - 3 years) with smooth beechwood frame and safety harness.',
    description: 'Designed with love for your little ones. Our Baby Swing Off-White features smooth splinter-free rounded beechwood bars, deep breathable macrame sides that cradle baby securely, and an integrated 3-point safety harness. Tested up to 25 kg load capacity.',
    specs: {
      weight_capacity: '25 kg (For ages 6 months to 3 years)',
      material: 'Natural Beechwood & Hypoallergenic Organic Cotton',
      dimensions: 'Seat: 35 x 35 cm, Hanging Rope: 150 cm adjustable',
      safety: 'Tested 3-point safety harness & non-toxic organic finishes',
      hardware: 'Heavy duty ceiling hook included'
    },
    variants: [
      { id: 'var_bs_standard', title: 'Standard Off-White', price: 2499, sku: 'RY-SW-BS-OW', inventory: 7 },
      { id: 'var_bs_pillow', title: 'Off-White + Soft Knitted Cushion', price: 2899, sku: 'RY-SW-BS-PAD', inventory: 3 }
    ],
    tags: ['baby', 'nursery', 'swing', 'safety', 'organic', 'toddler']
  },
  {
    id: 'prod_swing_03',
    name: 'A-Hanging Baby Crib',
    handle: 'a-hanging-crib',
    collection_id: 'swings',
    category: 'swings',
    price: 4999,
    compare_at_price: 6499,
    badge: 'Heirloom Piece',
    featured: false,
    rating: 5.0,
    review_count: 17,
    inventory: 5,
    images: [
      'http://localhost:5000/images/swing_crib_1.jpg',
      'http://localhost:5000/images/swing_crib_2.jpg'
    ],
    short_description: 'Suspended organic macrame bassinet crib with firm breathable mattress pad for newborn soothing.',
    description: 'Provide your newborn with the soothing sensation of gentle natural swaying. Hand-knotted with organic unbleached cotton, featuring ventilated mesh walls for optimum airflow and visibility. Includes custom-fitted organic cotton mattress pad.',
    specs: {
      weight_capacity: '25 kg (Birth to approximately 9 months / until rolling over)',
      material: 'Organic Cotton Rope & Teak Wood Baseboard',
      dimensions: 'Crib Basket: 85 x 50 x 35 cm',
      mattress: 'Included 2-inch firm orthopedic organic cotton mattress',
      hardware: 'Dual suspension ceiling mount kit included'
    },
    variants: [
      { id: 'var_hc_natural', title: 'Natural Macrame + Mattress', price: 4999, sku: 'RY-SW-HC-NAT', inventory: 5 }
    ],
    tags: ['crib', 'bassinet', 'nursery', 'heirloom', 'baby']
  },
  {
    id: 'prod_swing_04',
    name: 'Boho Paradise Hammock Chair',
    handle: 'boho-paradise-hammock-chair',
    collection_id: 'swings',
    category: 'swings',
    price: 3499,
    compare_at_price: 4299,
    badge: '',
    featured: false,
    rating: 4.8,
    review_count: 22,
    inventory: 7,
    images: [
      'http://localhost:5000/images/swing_hammock_1.jpg',
      'http://localhost:5000/images/swing_hammock_2.jpg'
    ],
    short_description: 'Deep-pocket hanging hammock swing with thick padded round cushion and hand-knotted fringe.',
    description: 'Transform your patio or living room into a bohemian oasis. Deep ergonomic basket shape envelopes your body for effortless reading, meditation, or napping.',
    specs: {
      weight_capacity: '120 kg Load Rating',
      material: 'Woven Cotton-Poly Canvas & Hardwood Spreader Bar',
      dimensions: 'Seat: 90 cm diameter, Total Drop: 130 cm',
      hardware: 'Stainless steel carabiner included'
    },
    variants: [
      { id: 'var_bp_cream', title: 'Alabaster Cream', price: 3499, sku: 'RY-SW-BP-CRM', inventory: 4 },
      { id: 'var_bp_sage', title: 'Earthy Sage', price: 3499, sku: 'RY-SW-BP-SGE', inventory: 3 }
    ],
    tags: ['hammock', 'swing', 'chair', 'boho', 'patio']
  },
  {
    id: 'prod_swing_05',
    name: 'Luna Nursery Swing Natural',
    handle: 'luna-nursery-swing',
    collection_id: 'swings',
    category: 'swings',
    price: 2699,
    compare_at_price: 3399,
    badge: 'New',
    featured: false,
    rating: 4.9,
    review_count: 13,
    inventory: 6,
    images: [
      'http://localhost:5000/images/swing_luna_1.jpg',
      'http://localhost:5000/images/swing_luna_2.jpg'
    ],
    short_description: 'Curved birchwood frame with hand-knotted macrame backrest and safety beads.',
    description: 'Gentle curved wooden cradle bars keep little bodies safe while sensory natural wooden beads entertain their curious fingers. Tested up to 25 kg.',
    specs: {
      weight_capacity: '25 kg (Ages 8 months - 3.5 years)',
      material: 'Sustainably Harvested Birchwood & Cotton Cords',
      dimensions: 'Seat: 38 x 38 cm',
      safety: 'Dual-lock safety strap and non-pinch ropes'
    },
    variants: [
      { id: 'var_ln_std', title: 'Standard Natural', price: 2699, sku: 'RY-SW-LN-STD', inventory: 6 }
    ],
    tags: ['nursery', 'toddler', 'swing', 'birchwood']
  },
  {
    id: 'prod_swing_06',
    name: 'Solstice Grand Lounge Swing',
    handle: 'solstice-lounge-swing',
    collection_id: 'swings',
    category: 'swings',
    price: 5999,
    compare_at_price: 7999,
    badge: 'Luxury',
    featured: false,
    rating: 5.0,
    review_count: 7,
    inventory: 3,
    images: [
      'http://localhost:5000/images/swing_solstice_1.jpg',
      'http://localhost:5000/images/swing_solstice_2.jpg'
    ],
    short_description: 'Extra wide two-seater macrame lounge bench with solid iron reinforcing and plush back pillow.',
    description: 'Our most luxurious seating experience. Generously proportioned to seat two adults comfortably or curl up completely with a good book. Tested to hold up to 150 kg.',
    specs: {
      weight_capacity: '150 kg Load Rating',
      material: 'Industrial Powder-Coated Steel Rim & 6mm Braided Cotton Rope',
      dimensions: 'Width: 120 cm, Depth: 80 cm, Drop: 150 cm'
    },
    variants: [
      { id: 'var_sl_bench', title: 'Complete Lounge Swing + 2 Pillows', price: 5999, sku: 'RY-SW-SL-BNCH', inventory: 3 }
    ],
    tags: ['lounge', 'swing', 'two-seater', 'luxury', 'patio']
  },

  // 3. HOME DECOR
  {
    id: 'prod_decor_01',
    name: 'Sunflower Curtain Ties - Pastel Pink',
    handle: 'pink-sunflower-curtain-tie',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 899,
    compare_at_price: 1199,
    badge: 'Bestseller',
    featured: true,
    rating: 4.9,
    review_count: 53,
    inventory: 25,
    images: [
      'http://localhost:5000/images/tie_sunflower_pink_1.jpg',
      'http://localhost:5000/images/tie_sunflower_pink_2.jpg'
    ],
    short_description: 'Handcrafted crochet blossom curtain tiebacks in soft pastel pink. Available in Pairs (2 Pcs) or Single (1 Pc).',
    description: 'Add a blooming touch to your curtains! Hand-crocheted with plush milk cotton yarn, each sunflower features textured petals, a textured brown seed center, and braided tie straps with natural wooden bead accents.',
    specs: {
      flower_size: 'Flower Diameter: 12 cm, Strap Length: 45 cm each side',
      material: '100% Milk Cotton Yarn + Polished Wooden Beads',
      includes: 'Available as Pair (Set of 2) or Single (1 Piece)'
    },
    variants: [
      { id: 'var_tie_pk_pair', title: 'Pair (2 Pieces)', price: 899, sku: 'RY-HD-SF-PK-2', inventory: 18 },
      { id: 'var_tie_pk_single', title: 'Single (1 Piece)', price: 499, sku: 'RY-HD-SF-PK-1', inventory: 7 }
    ],
    tags: ['curtain tie', 'sunflower', 'pink', 'crochet', 'decor']
  },
  {
    id: 'prod_decor_02',
    name: 'Sunflower Curtain Ties - Dusty Blue',
    handle: 'blue-sunflower-curtain-tie',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 899,
    compare_at_price: 1199,
    badge: 'Staff Pick',
    featured: true,
    rating: 4.8,
    review_count: 36,
    inventory: 20,
    images: [
      'http://localhost:5000/images/tie_sunflower_blue_1.jpg',
      'http://localhost:5000/images/tie_sunflower_blue_2.jpg'
    ],
    short_description: 'Artisanal crochet sunflower tiebacks in serene French dusty blue.',
    description: 'A soothing coastal aesthetic for your drapes. Hand-knitted with meticulous tension to keep petals crisp and lively. Wraps smoothly around heavy blackout drapes or light sheer curtains.',
    specs: {
      flower_size: 'Flower Diameter: 12 cm, Strap Length: 45 cm',
      material: 'Milk Cotton Yarn',
      includes: 'Pair (Set of 2) or Single'
    },
    variants: [
      { id: 'var_tie_bl_pair', title: 'Pair (2 Pieces)', price: 899, sku: 'RY-HD-SF-BL-2', inventory: 15 },
      { id: 'var_tie_bl_single', title: 'Single (1 Piece)', price: 499, sku: 'RY-HD-SF-BL-1', inventory: 5 }
    ],
    tags: ['curtain tie', 'sunflower', 'blue', 'crochet']
  },
  {
    id: 'prod_decor_03',
    name: 'Sunflower Curtain Ties - Warm Marigold',
    handle: 'golden-sunflower-curtain-tie',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 899,
    compare_at_price: 1199,
    badge: 'Popular',
    featured: false,
    rating: 5.0,
    review_count: 29,
    inventory: 18,
    images: [
      'http://localhost:5000/images/tie_sunflower_gold_1.jpg',
      'http://localhost:5000/images/tie_sunflower_gold_2.jpg'
    ],
    short_description: 'Vibrant golden-yellow sunflower tiebacks that radiate warmth and cheerful charm.',
    description: 'The classic sunflower colorway. Features rich yellow and amber petals that catch natural daylight beautifully.',
    specs: {
      flower_size: 'Flower Diameter: 12 cm',
      material: 'Milk Cotton Yarn'
    },
    variants: [
      { id: 'var_tie_gd_pair', title: 'Pair (2 Pieces)', price: 899, sku: 'RY-HD-SF-GD-2', inventory: 13 },
      { id: 'var_tie_gd_single', title: 'Single (1 Piece)', price: 499, sku: 'RY-HD-SF-GD-1', inventory: 5 }
    ],
    tags: ['curtain tie', 'sunflower', 'marigold', 'yellow']
  },
  {
    id: 'prod_decor_04',
    name: 'Sage Leaf & Vine Curtain Tiebacks',
    handle: 'sage-vine-curtain-tie',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 999,
    compare_at_price: 1299,
    badge: '',
    featured: false,
    rating: 4.9,
    review_count: 14,
    inventory: 12,
    images: [
      'http://localhost:5000/images/tie_sage_vine_1.jpg',
      'http://localhost:5000/images/tie_sage_vine_2.jpg'
    ],
    short_description: 'Cascading crochet eucalyptus and ivy vine curtain tiebacks.',
    description: 'Intricately knitted trailing botanical leaves that drape gracefully around your curtains like a natural forest bough.',
    specs: {
      length: 'Total Garland Length: 60 cm',
      material: 'Combed Cotton Yarn'
    },
    variants: [
      { id: 'var_tie_vg_pair', title: 'Pair (2 Pieces)', price: 999, sku: 'RY-HD-VG-2', inventory: 9 },
      { id: 'var_tie_vg_single', title: 'Single (1 Piece)', price: 549, sku: 'RY-HD-VG-1', inventory: 3 }
    ],
    tags: ['curtain tie', 'eucalyptus', 'greenery', 'decor']
  },
  {
    id: 'prod_decor_05',
    name: 'Boho Mandala Wall Hanging',
    handle: 'macrame-mandala-wall-hanging',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 1699,
    compare_at_price: 2299,
    badge: 'Artisan Special',
    featured: false,
    rating: 4.8,
    review_count: 21,
    inventory: 8,
    images: [
      'http://localhost:5000/images/decor_mandala_1.jpg',
      'http://localhost:5000/images/decor_mandala_2.jpg'
    ],
    short_description: 'Intricate geometric hand-knotted macrame tapestry with driftwood header.',
    description: 'A striking focal piece for above a bed or living room sofa. Features intricate diamond knotting and long flowing fringed tassels mounted on a hand-sanded teak branch.',
    specs: {
      dimensions: 'Width: 60 cm, Length: 85 cm',
      material: '100% Unbleached 4mm Cotton Cord & Teak Wood'
    },
    variants: [
      { id: 'var_md_std', title: 'Standard (60x85 cm)', price: 1699, sku: 'RY-HD-MD-60', inventory: 8 }
    ],
    tags: ['wall hanging', 'macrame', 'mandala', 'tapestry']
  },
  {
    id: 'prod_decor_06',
    name: 'Daisy Crochet Coasters (Set of 6)',
    handle: 'botanical-coaster-set',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 699,
    compare_at_price: 899,
    badge: '',
    featured: false,
    rating: 4.9,
    review_count: 45,
    inventory: 30,
    images: [
      'http://localhost:5000/images/decor_coasters_1.jpg',
      'http://localhost:5000/images/decor_coasters_2.jpg'
    ],
    short_description: 'Pure cotton absorbent floral cup coasters with handmade holder basket.',
    description: 'Protect your tabletops in cheerful style. 6 absorbent hand-knitted daisy coasters that nestle neatly into their own woven crochet basket when not in use.',
    specs: {
      diameter: '11 cm each',
      material: '100% Absorbent Combed Cotton',
      includes: '6 Coasters + 1 Woven Basket Holder'
    },
    variants: [
      { id: 'var_cs_set6', title: 'Set of 6 + Basket', price: 699, sku: 'RY-HD-CS-6', inventory: 30 }
    ],
    tags: ['coasters', 'daisy', 'tabletop', 'gift']
  },
  {
    id: 'prod_decor_07',
    name: 'Sunflower Knitted Tissue Box Cover',
    handle: 'sunflower-tissue-box-cover',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 799,
    compare_at_price: 1099,
    badge: 'Cute Find',
    featured: false,
    rating: 4.7,
    review_count: 16,
    inventory: 14,
    images: [
      'http://localhost:5000/images/decor_tissue_1.jpg',
      'http://localhost:5000/images/decor_tissue_2.jpg'
    ],
    short_description: 'Cozy crochet slipcover for rectangular tissue boxes with 3D sunflower motif.',
    description: 'Conceal plain cardboard tissue boxes with artisanal cozy charm. Fits standard rectangular tissue boxes with an elasticated snug bottom border.',
    specs: {
      dimensions: 'Fits standard 23 x 12 x 9 cm boxes',
      material: 'Milk Cotton Yarn'
    },
    variants: [
      { id: 'var_tb_std', title: 'Standard Cover', price: 799, sku: 'RY-HD-TB-SF', inventory: 14 }
    ],
    tags: ['tissue cover', 'crochet', 'sunflower']
  },
  {
    id: 'prod_decor_08',
    name: 'Twin Tier Macrame Plant Hanger',
    handle: 'macrame-plant-hanger-duo',
    collection_id: 'home-decor',
    category: 'home-decor',
    price: 899,
    compare_at_price: 1199,
    badge: '',
    featured: false,
    rating: 4.9,
    review_count: 27,
    inventory: 16,
    images: [
      'http://localhost:5000/images/decor_planthanger_1.jpg',
      'http://localhost:5000/images/decor_planthanger_2.jpg'
    ],
    short_description: 'Two-tier vertical suspended planter ropes with spiral knot detailing.',
    description: 'Elevate your indoor jungle. Holds two planters vertically to save floor space while showcasing trailing pothos, monsteras, or succulents.',
    specs: {
      length: 'Total Length: 130 cm',
      capacity: 'Holds pots from 10 to 22 cm diameter'
    },
    variants: [
      { id: 'var_ph_2tier', title: 'Two-Tier Hanger', price: 899, sku: 'RY-HD-PH-2T', inventory: 16 }
    ],
    tags: ['plant hanger', 'macrame', 'plants', 'boho']
  },

  // 4. FOREVER FLOWER
  {
    id: 'prod_flwr_01',
    name: 'Always Glowing Forever Bouquet',
    handle: 'always-glowing-bouquet',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 1799,
    compare_at_price: 2299,
    badge: 'Signature',
    featured: true,
    rating: 5.0,
    review_count: 67,
    inventory: 20,
    images: [
      'http://localhost:5000/images/flower_always_glowing_1.jpg',
      'http://localhost:5000/images/flower_always_glowing_2.jpg'
    ],
    short_description: "Hand-knitted bouquet of calla lilies, blush peonies, and baby's breath with built-in warm LED fairy lights.",
    description: 'Our most celebrated bouquet. Lovingly handcrafted by rural women artisans, featuring everlasting milk cotton blooms that glow magically at night. Includes warm fairy lights with discreet hidden battery pack.',
    specs: {
      stem_count: '9 Handcrafted Stems',
      height: 'Approx 38 cm height',
      lights: 'Warm White Micro LED (Batteries included)',
      wrapping: 'Korean matte waterproof wrapping with silk ribbon'
    },
    variants: [
      { id: 'var_ag_lights', title: 'With Fairy Lights Included', price: 1799, sku: 'RY-FF-AG-LGT', inventory: 15 },
      { id: 'var_ag_plain', title: 'Without Fairy Lights', price: 1599, sku: 'RY-FF-AG-PLN', inventory: 5 }
    ],
    tags: ['bouquet', 'forever flower', 'fairy lights', 'gift', 'bestseller']
  },
  {
    id: 'prod_flwr_02',
    name: 'Lily in Red Forever Bouquet',
    handle: 'lily-in-red-bouquet',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 1699,
    compare_at_price: 2199,
    badge: 'Romantic Choice',
    featured: true,
    rating: 4.9,
    review_count: 41,
    inventory: 15,
    images: [
      'http://localhost:5000/images/flower_lily_red_1.jpg',
      'http://localhost:5000/images/flower_lily_red_2.jpg'
    ],
    short_description: 'Crimson red royal lilies with eucalyptus sprigs in premium golden wrapping.',
    description: 'Express timeless romance. Vibrant crimson petals with intricate stamens hand-crocheted to botanical accuracy. A forever expression of devotion.',
    specs: {
      stem_count: '7 Stems (3 Royal Lilies, 2 Roses, 2 Eucalyptus)',
      height: '35 cm height',
      lights: 'Optional Fairy Lights'
    },
    variants: [
      { id: 'var_lr_lights', title: 'With Warm LED Lights', price: 1699, sku: 'RY-FF-LR-LGT', inventory: 12 },
      { id: 'var_lr_plain', title: 'Standard Bouquet', price: 1499, sku: 'RY-FF-LR-PLN', inventory: 3 }
    ],
    tags: ['lily', 'red', 'romance', 'forever flower']
  },
  {
    id: 'prod_flwr_03',
    name: 'Bageecha Artisan Flower Garden',
    handle: 'bageecha-grand-bouquet',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 2499,
    compare_at_price: 3199,
    badge: 'Grand Arrangement',
    featured: false,
    rating: 5.0,
    review_count: 28,
    inventory: 10,
    images: [
      'http://localhost:5000/images/flower_bageecha_1.jpg',
      'http://localhost:5000/images/flower_bageecha_2.jpg'
    ],
    short_description: '12-stem grand bouquet combining sunflowers, lavender sprigs, and pastel daisies.',
    description: 'Bageecha means garden in Hindi. This extravagant arrangement captures the chaotic beauty of a blooming cottage garden in eternal hand-knitted form.',
    specs: {
      stem_count: '12 Stems',
      height: '42 cm height'
    },
    variants: [
      { id: 'var_bg_grand', title: '12-Stem Grand Bouquet + Lights', price: 2499, sku: 'RY-FF-BG-12', inventory: 10 }
    ],
    tags: ['grand', 'bageecha', 'sunflower', 'bouquet']
  },
  {
    id: 'prod_flwr_04',
    name: 'Sunshine Daisy in Knitted Pot',
    handle: 'sunshine-daisy-pot',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 799,
    compare_at_price: 999,
    badge: 'Desk Decor',
    featured: false,
    rating: 4.8,
    review_count: 32,
    inventory: 22,
    images: [
      'http://localhost:5000/images/flower_daisy_pot_1.jpg',
      'http://localhost:5000/images/flower_daisy_pot_2.jpg'
    ],
    short_description: 'Mini tabletop planter with 3 cheerful crocheted daisies potted in weighted yarn soil.',
    description: 'Brighten your work desk or windowsill. No watering, no sunlight needed — just pure joy 365 days a year.',
    specs: {
      height: '18 cm total height',
      base: 'Weighted crochet ceramic-style pot'
    },
    variants: [
      { id: 'var_dp_single', title: 'Single Potted Daisy', price: 799, sku: 'RY-FF-DP-STD', inventory: 22 }
    ],
    tags: ['daisy', 'pot', 'desk', 'decor']
  },
  {
    id: 'prod_flwr_05',
    name: 'Vintage Dust Rose Trio',
    handle: 'vintage-rose-trio',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 999,
    compare_at_price: 1299,
    badge: '',
    featured: false,
    rating: 4.9,
    review_count: 19,
    inventory: 16,
    images: [
      'http://localhost:5000/images/flower_vintage_rose_1.jpg',
      'http://localhost:5000/images/flower_vintage_rose_2.jpg'
    ],
    short_description: '3 stems of heirloom English garden roses in dusty mauve, cream, and blush.',
    description: 'Subtle antique hues reminiscent of vintage tea gardens. Looks stunning in a slender ceramic bud vase.',
    specs: {
      stem_count: '3 Large Rose Stems',
      length: '32 cm stems'
    },
    variants: [
      { id: 'var_vr_trio', title: 'Set of 3 Roses', price: 999, sku: 'RY-FF-VR-3', inventory: 16 }
    ],
    tags: ['rose', 'vintage', 'dusty rose']
  },
  {
    id: 'prod_flwr_06',
    name: 'Lavender Fields Forever Sprigs',
    handle: 'lavender-fields-bundle',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 899,
    compare_at_price: 1199,
    badge: '',
    featured: false,
    rating: 4.7,
    review_count: 23,
    inventory: 18,
    images: [
      'http://localhost:5000/images/flower_lavender_1.jpg',
      'http://localhost:5000/images/flower_lavender_2.jpg'
    ],
    short_description: 'Bundle of 5 hand-crocheted fragrant-looking lavender stems with green leaves.',
    description: 'Provence charm brought into your bedroom. Placed in a vase or tied with twine on your dressing table.',
    specs: {
      stem_count: '5 Lavender Sprigs',
      length: '30 cm stems'
    },
    variants: [
      { id: 'var_lf_bundle', title: 'Bundle of 5', price: 899, sku: 'RY-FF-LF-5', inventory: 18 }
    ],
    tags: ['lavender', 'crochet', 'purple']
  },
  {
    id: 'prod_flwr_07',
    name: 'Tulip Harmony Pastel Bouquet',
    handle: 'tulip-harmony-bouquet',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 1299,
    compare_at_price: 1699,
    badge: 'Popular',
    featured: false,
    rating: 4.9,
    review_count: 35,
    inventory: 14,
    images: [
      'http://localhost:5000/images/flower_tulip_1.jpg',
      'http://localhost:5000/images/flower_tulip_2.jpg'
    ],
    short_description: '5 pastel tulips in soft pink, cream, peach, and lavender with delicate green leaves.',
    description: 'Crisp spring morning vibes in a neat hand-tied bouquet wrapped in frosted parchment.',
    specs: {
      stem_count: '5 Stems',
      height: '32 cm'
    },
    variants: [
      { id: 'var_th_std', title: '5-Stem Tulip Bouquet', price: 1299, sku: 'RY-FF-TH-5', inventory: 14 }
    ],
    tags: ['tulips', 'pastel', 'bouquet']
  },
  {
    id: 'prod_flwr_08',
    name: 'Autumn Whisper Arrangement',
    handle: 'autumn-whisper-arrangement',
    collection_id: 'forever-flower',
    category: 'forever-flower',
    price: 1599,
    compare_at_price: 1999,
    badge: 'New',
    featured: false,
    rating: 4.8,
    review_count: 12,
    inventory: 9,
    images: [
      'http://localhost:5000/images/flower_autumn_1.jpg',
      'http://localhost:5000/images/flower_autumn_2.jpg'
    ],
    short_description: 'Harmonious blend of knitted sunflowers, terracotta roses, and dried bunny tails.',
    description: 'Earthy bohemian warmth. Crocheted everlasting elements interwoven with sustainably harvested dried florals.',
    specs: {
      stem_count: '8 Elements',
      height: '36 cm'
    },
    variants: [
      { id: 'var_aw_std', title: 'Standard Arrangement', price: 1599, sku: 'RY-FF-AW-8', inventory: 9 }
    ],
    tags: ['autumn', 'sunflower', 'dried flowers']
  },

  // 5. ACCESSORIES & PLUSHIES
  {
    id: 'prod_plush_01',
    name: 'Millie the Duck Amigurumi Plush',
    handle: 'millie-the-duck-plush',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 1199,
    compare_at_price: 1499,
    badge: 'Crowd Favorite',
    featured: true,
    rating: 5.0,
    review_count: 58,
    inventory: 20,
    images: [
      'http://localhost:5000/images/plush_millie_duck_1.jpg',
      'http://localhost:5000/images/plush_millie_duck_2.jpg'
    ],
    short_description: 'Ultra-soft hypoallergenic milk cotton duck plushie with yellow boots and sunhat (25 cm).',
    description: 'Meet Millie! Hand-crocheted stitch-by-stitch with 100% organic, child-safe milk cotton yarn and stuffed with hypoallergenic recycled polyfill. Her tiny yellow boots and removable bonnet make her irresistible to kids and adults alike.',
    specs: {
      height: '25 cm standing',
      material: 'Hypoallergenic Organic Milk Cotton Yarn + Polyfill',
      safety: 'Safety-locked embroidered eyes (zero choking hazards)',
      wash_care: 'Gentle spot clean or surface hand wash'
    },
    variants: [
      { id: 'var_md_std', title: 'Millie with Yellow Boots', price: 1199, sku: 'RY-PL-ML-DK', inventory: 20 }
    ],
    tags: ['duck', 'plush', 'amigurumi', 'nursery', 'toy', 'gift']
  },
  {
    id: 'prod_plush_02',
    name: 'Toby the Floppy Bunny Plush',
    handle: 'toby-the-bunny-plush',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 1399,
    compare_at_price: 1799,
    badge: 'Bestseller',
    featured: true,
    rating: 4.9,
    review_count: 44,
    inventory: 15,
    images: [
      'http://localhost:5000/images/plush_toby_bunny_1.jpg',
      'http://localhost:5000/images/plush_toby_bunny_2.jpg'
    ],
    short_description: 'Heirloom floppy-eared bunny with hand-knitted floral overalls (30 cm).',
    description: 'An heirloom keepsake designed to be cherished for generations. Toby has long floppy ears perfect for little hands to hold, and removable knitted sage overalls.',
    specs: {
      height: '30 cm tall',
      material: 'Organic Milk Cotton'
    },
    variants: [
      { id: 'var_tb_std', title: 'Toby in Sage Overalls', price: 1399, sku: 'RY-PL-TB-BN', inventory: 15 }
    ],
    tags: ['bunny', 'plush', 'heirloom', 'toy']
  },
  {
    id: 'prod_plush_03',
    name: 'Leo the Cozy Striped Cat',
    handle: 'leo-the-cat-plush',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 1099,
    compare_at_price: 1399,
    badge: '',
    featured: false,
    rating: 4.8,
    review_count: 29,
    inventory: 18,
    images: [
      'http://localhost:5000/images/plush_leo_cat_1.jpg',
      'http://localhost:5000/images/plush_leo_cat_2.jpg'
    ],
    short_description: 'Cuddle-ready ginger tabby cat with sleepy embroidered eyes and curved tail (22 cm).',
    description: 'For all cat lovers! Soft ginger stripes, a curved tail, and sleepy embroidered eyelashes make Leo the ultimate calming desk or bedtime buddy.',
    specs: {
      height: '22 cm',
      material: 'Organic Cotton Yarn'
    },
    variants: [
      { id: 'var_lc_std', title: 'Leo Tabby Cat', price: 1099, sku: 'RY-PL-LC-CT', inventory: 18 }
    ],
    tags: ['cat', 'tabby', 'plush', 'amigurumi']
  },
  {
    id: 'prod_plush_04',
    name: 'Handcrafted Daisy Granny Square Tote',
    handle: 'daisy-tote-bag',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 1499,
    compare_at_price: 1999,
    badge: 'Trending',
    featured: true,
    rating: 4.9,
    review_count: 37,
    inventory: 16,
    images: [
      'http://localhost:5000/images/bag_daisy_tote_1.jpg',
      'http://localhost:5000/images/bag_daisy_tote_2.jpg'
    ],
    short_description: 'Spacious bohemian granny-square shoulder bag with cotton canvas inner lining and phone pocket.',
    description: 'The viral crochet tote handcrafted with precision. Composed of 13 hand-joined floral granny squares, fully lined with durable cotton canvas to prevent stretching and sagging. Fits a 13-inch laptop, water bottle, and daily essentials.',
    specs: {
      dimensions: '36 x 38 cm, Strap drop: 28 cm',
      lining: 'Sturdy cotton canvas lining with interior zipper pocket',
      capacity: 'Fits up to 13-inch MacBook & essentials'
    },
    variants: [
      { id: 'var_dt_cream', title: 'Alabaster Cream Base', price: 1499, sku: 'RY-AC-DT-CRM', inventory: 10 },
      { id: 'var_dt_black', title: 'Onyx Black Base', price: 1499, sku: 'RY-AC-DT-BLK', inventory: 6 }
    ],
    tags: ['tote bag', 'granny square', 'crochet bag', 'accessories']
  },
  {
    id: 'prod_plush_05',
    name: 'Sunflower Crochet Crossbody Pouch',
    handle: 'sunflower-crossbody-bag',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 899,
    compare_at_price: 1199,
    badge: '',
    featured: false,
    rating: 4.7,
    review_count: 25,
    inventory: 14,
    images: [
      'http://localhost:5000/images/bag_sunflower_cross_1.jpg',
      'http://localhost:5000/images/bag_sunflower_cross_2.jpg'
    ],
    short_description: 'Circular sunflower phone pouch with zip closure and braided crossbody strap.',
    description: 'Lightweight and hands-free. Fits any smartphone, cards, and lip balm with ease. Features sturdy top zipper closure.',
    specs: {
      diameter: '18 cm diameter, Strap length: 110 cm',
      closure: 'Smooth metal zipper'
    },
    variants: [
      { id: 'var_sc_std', title: 'Crossbody Pouch', price: 899, sku: 'RY-AC-SC-PCH', inventory: 14 }
    ],
    tags: ['crossbody', 'sunflower', 'phone bag']
  },
  {
    id: 'prod_plush_06',
    name: 'Barnaby the Gentle Bear',
    handle: 'barnaby-the-bear-plush',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 1299,
    compare_at_price: 1699,
    badge: '',
    featured: false,
    rating: 4.9,
    review_count: 18,
    inventory: 11,
    images: [
      'http://localhost:5000/images/plush_barnaby_bear_1.jpg',
      'http://localhost:5000/images/plush_barnaby_bear_2.jpg'
    ],
    short_description: 'Warm honey brown plush bear with knitted neckerchief (28 cm).',
    description: 'Classic childhood nostalgia. Soft honey brown fur knit with cute rounded ears and cozy neckerchief.',
    specs: {
      height: '28 cm',
      material: 'Organic Combed Cotton'
    },
    variants: [
      { id: 'var_bb_std', title: 'Barnaby Bear', price: 1299, sku: 'RY-PL-BB-BR', inventory: 11 }
    ],
    tags: ['bear', 'plush', 'classic toy']
  },
  {
    id: 'prod_plush_07',
    name: 'Pip the Little Knitted Penguin',
    handle: 'pip-the-penguin-plush',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 999,
    compare_at_price: 1299,
    badge: 'Cute',
    featured: false,
    rating: 4.8,
    review_count: 14,
    inventory: 12,
    images: [
      'http://localhost:5000/images/plush_pip_penguin_1.jpg',
      'http://localhost:5000/images/plush_pip_penguin_2.jpg'
    ],
    short_description: 'Chubby nursery companion in grey and cream with tiny mustard scarf (18 cm).',
    description: 'Pip is small, round, and cuddly. Designed specifically for tiny hands to grasp securely.',
    specs: {
      height: '18 cm',
      material: 'Organic Cotton'
    },
    variants: [
      { id: 'var_pp_std', title: 'Pip Penguin', price: 999, sku: 'RY-PL-PP-PNG', inventory: 12 }
    ],
    tags: ['penguin', 'plush', 'cute']
  },
  {
    id: 'prod_plush_08',
    name: 'Pastel Cotton Net Market Bag',
    handle: 'boho-market-net-bag',
    collection_id: 'accessories-plushies',
    category: 'accessories-plushies',
    price: 599,
    compare_at_price: 799,
    badge: 'Eco Friendly',
    featured: false,
    rating: 4.9,
    review_count: 33,
    inventory: 25,
    images: [
      'http://localhost:5000/images/bag_market_net_1.jpg',
      'http://localhost:5000/images/bag_market_net_2.jpg'
    ],
    short_description: 'Expandable French-style organic cotton netted farmers market bag.',
    description: 'Zero plastic waste shopping in Parisian style. Expands effortlessly to hold fruits, bread, and groceries.',
    specs: {
      capacity: 'Holds up to 8 kg of groceries',
      material: '100% Unbleached Cotton Mesh'
    },
    variants: [
      { id: 'var_mb_cream', title: 'Natural Alabaster', price: 599, sku: 'RY-AC-MB-CRM', inventory: 15 },
      { id: 'var_mb_olive', title: 'Forest Olive', price: 599, sku: 'RY-AC-MB-OLV', inventory: 10 }
    ],
    tags: ['market bag', 'net bag', 'eco-friendly', 'zero waste']
  }
];

const dest = path.join(__dirname, 'products.json');
fs.writeFileSync(dest, JSON.stringify(products, null, 2), 'utf8');
console.log(`Saved ${products.length} products to ${dest}`);

