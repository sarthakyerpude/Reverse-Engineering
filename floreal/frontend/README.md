# Floreal Frontend Storefront

A high-performance, standalone D2C web storefront for **Floreal** (Shark Tank India Season 5 brand) built with pure semantic **HTML5, CSS3 Custom Properties, and Modern Vanilla JavaScript**.

## Complete Page Directory (14 Core Views)

| Page | File | Description |
|---|---|---|
| **Home** | `index.html` | First page with hero slider, Instagram story bubbles, Shark Tank S5 banner, best sellers, category tabs filter, product grid, UGC photo reviews, FAQ accordion, and footer |
| **All Collections** | `collections.html` | Browses all 25 collections with multi-facet sidebar filter (price slider ₹199–₹4,999, category radio filters, in-stock toggle), sorting dropdown, and 4-column product grid |
| **Product Detail (PDP)** | `product.html` | Dynamic product page (`?id=...`) with thumbnail image gallery, zoom lens, color swatches, stem count pills, quantity stepper, Add to Cart, Buy Now, WhatsApp order, Pincode delivery estimator, gifting add-ons, and care tabs |
| **Flower Bag (Cart)** | `cart.html` | Standalone full-page shopping cart with dynamic ₹999 free shipping meter, itemized table, quantity steppers, personalized gift note input, and checkout buttons |
| **2-Step Checkout** | `checkout.html` | Step 1 (Contact & Indian Address with PIN auto-fill) + Step 2 (Shipping & Razorpay UPI/Cards/COD payment simulation), coupon promo code input, and order summary |
| **Order Confirmed** | `order-success.html` | Order success page displaying Order ID `#FLO-XXXXX`, delivery address, items summary, printable receipt button, and tracking link |
| **Order Tracking** | `track-order.html` | Self-service tracking portal with 5-stage visual stepper (Placed → Crafting → Packed → Dispatched → Delivered), transit activity log, sample order demo pills, and WhatsApp support |
| **Saved Wishlist** | `wishlist.html` | LocalStorage persistent wishlist with "Move to Cart" actions and empty states |
| **Customer Account** | `account.html` | Customer profile, past order history with 1-click reorder buttons, saved delivery addresses, and flower care tabs |
| **Artisan Admin Desk** | `admin.html` | Protected operations desk with gross sales metrics, live orders table with 1-click stage advancement, and inventory toggles for all 131 SKUs |
| **Our Story** | `about.html` | Founding story, female artisan empowerment mission, and Shark Tank India Season 5 journey |
| **Contact Support** | `contact.html` | Direct WhatsApp desk, support coordinates, response SLA, and inquiry form |
| **Shipping Policy** | `shipping-policy.html` | Pan-India delivery timelines, ₹999 free shipping terms, and crush-proof packaging guarantee |
| **Returns Policy** | `returns-policy.html` | 48-hour transit damage replacement policy and unboxing video guidelines |
| **Care Guide** | `care-guide.html` | Dusting, reshaping, and scenting guide for forever crochet blooms |

## Key Frontend Modules (`assets/js/`)
- `products-data.js`: 131 authenticated products across 25 collections.
- `cart.js`: LocalStorage cart engine, dynamic ₹999 free shipping meter, cross-tab sync via `storage` listener, drawer controls.
- `wishlist.js`: LocalStorage wishlist engine and live counter badges.
- `checkout.js`: 2-Step checkout validation, pincode lookup, coupon system, Razorpay modal simulation.
- `tracking.js`: Order tracking lookup engine and 5-stage timeline renderer.
- `admin.js`: Artisan order progression and inventory management.
- `quickview.js`: Rapid product inspection modal.
- `search.js`: Zero-latency predictive search modal.
- `social-proof.js`: Live purchase notification toasts.
- `app.js`: Global site bootstrap, filtering, sorting, mobile menu drawer.

## Quickstart
Open `index.html` directly in your browser or run via any static web server:
```bash
npx serve .
```

