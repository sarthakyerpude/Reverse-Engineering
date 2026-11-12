const express = require('express');
const router = express.Router();

router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  // Signature verification simulation
  // In production, verify using crypto: crypto.createHmac('sha256', secret).update(order_id + "|" + payment_id).digest('hex')
  if (!razorpay_payment_id) {
    return res.status(400).json({ success: false, error: 'Payment ID is required' });
  }

  res.json({
    success: true,
    message: 'Payment verified successfully',
    transactionId: razorpay_payment_id,
    orderReference: orderId || 'FLO-SUCCESS'
  });
});

module.exports = router;

