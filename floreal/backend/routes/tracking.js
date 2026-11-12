const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const ordersFilePath = path.join(__dirname, '../data/orders.json');

router.post('/', (req, res) => {
  const { query, phone } = req.body;

  if (!query && !phone) {
    return res.status(400).json({ success: false, error: 'Order reference or phone number required' });
  }

  let orders = [];
  try {
    const raw = fs.readFileSync(ordersFilePath, 'utf8');
    orders = JSON.parse(raw);
  } catch (e) {
    orders = [];
  }

  const cleanQuery = (query || '').trim().toUpperCase();

  const found = orders.find(o => 
    (o.orderNumber && o.orderNumber.toUpperCase() === cleanQuery) ||
    (o.awb && o.awb.toUpperCase() === cleanQuery) ||
    (phone && o.customer && o.customer.phone && o.customer.phone.includes(phone))
  );

  if (!found) {
    return res.status(404).json({ success: false, error: 'No active shipment found matching query' });
  }

  res.json({
    success: true,
    order: found
  });
});

module.exports = router;

