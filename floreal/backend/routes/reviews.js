/**
 * Product Reviews API
 * Amazon-style star ratings, text feedback, verified purchase tags
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/reviews/:productId — Get reviews and rating stats
router.get('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = db.prepare(`
      SELECT id, product_id, user_name, rating, title, comment, verified_purchase, created_at
      FROM reviews
      WHERE product_id = ?
      ORDER BY created_at DESC
    `).all(productId);

    const stats = {
      total: reviews.length,
      average: 5.0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    if (reviews.length > 0) {
      let sum = 0;
      reviews.forEach(r => {
        sum += r.rating;
        stats.distribution[r.rating] = (stats.distribution[r.rating] || 0) + 1;
      });
      stats.average = parseFloat((sum / reviews.length).toFixed(1));
    }

    res.json({ success: true, stats, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve reviews.' });
  }
});

// POST /api/reviews/:productId — Post a review
router.post('/:productId', authenticateToken, (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const numRating = parseInt(rating, 10);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5 stars.' });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Please write a brief comment.' });
    }

    const reviewId = uuidv4();
    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, user_name, rating, title, comment, verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      reviewId,
      productId,
      req.user.id,
      req.user.name,
      numRating,
      title ? title.trim() : '',
      comment.trim()
    );

    const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
    res.status(201).json({ success: true, message: 'Thank you! Your review has been published.', review: created });
  } catch (err) {
    console.error('Review submit error:', err);
    res.status(500).json({ success: false, error: 'Failed to post review.' });
  }
});

module.exports = router;

