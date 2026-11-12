const express = require('express');
const router = express.Router();

const PINCODE_MAP = {
  '110001': { city: 'New Delhi', state: 'Delhi', days: 2 },
  '400001': { city: 'Mumbai', state: 'Maharashtra', days: 2 },
  '560001': { city: 'Bengaluru', state: 'Karnataka', days: 3 },
  '700001': { city: 'Kolkata', state: 'West Bengal', days: 3 },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 3 },
  '500001': { city: 'Hyderabad', state: 'Telangana', days: 3 },
  '411001': { city: 'Pune', state: 'Maharashtra', days: 1 },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 2 }
};

router.get('/:pincode', (req, res) => {
  const pin = req.params.pincode;

  if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
    return res.status(400).json({ success: false, error: 'Invalid 6-digit Indian PIN code' });
  }

  if (PINCODE_MAP[pin]) {
    const info = PINCODE_MAP[pin];
    return res.json({
      success: true,
      serviceable: true,
      city: info.city,
      state: info.state,
      estimatedDays: info.days,
      freeShippingEligible: true,
      message: `Express Courier delivery available in ${info.days}–${info.days + 2} days`
    });
  }

  // General pan-India fallback
  res.json({
    success: true,
    serviceable: true,
    city: 'India',
    state: 'Pan-India',
    estimatedDays: 4,
    freeShippingEligible: true,
    message: 'Pan-India express delivery available in 4–6 business days'
  });
});

module.exports = router;

