const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { optionalToken } = require('../middleware/auth');

// GET /api/reviews/:productId
router.get('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = db.prepare(`
      SELECT * FROM reviews 
      WHERE product_id = ? 
      ORDER BY created_at DESC
    `).all(productId);

    const total = reviews.length;
    let avg = 5.0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (total > 0) {
      const sum = reviews.reduce((acc, r) => {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        return acc + r.rating;
      }, 0);
      avg = Number((sum / total).toFixed(1));
    }

    res.json({
      success: true,
      product_id: productId,
      total_reviews: total,
      average_rating: avg,
      rating_distribution: distribution,
      reviews
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve reviews' });
  }
});

// POST /api/reviews/:productId
router.post('/:productId', optionalToken, (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, headline, review_text, user_name } = req.body;

    if (!rating || !review_text) {
      return res.status(400).json({ success: false, error: 'Rating and review comment are required.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5 stars.' });
    }

    const authorName = req.user ? req.user.full_name : (user_name ? user_name.trim() : 'Artisan Enthusiast');
    const id = `rev_${uuidv4()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, user_name, rating, headline, review_text, verified_purchase, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      productId,
      req.user ? req.user.id : null,
      authorName,
      numRating,
      headline ? headline.trim() : null,
      review_text.trim(),
      now
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your review has been published.',
      review: {
        id,
        product_id: productId,
        user_name: authorName,
        rating: numRating,
        headline,
        review_text,
        created_at: now
      }
    });
  } catch (error) {
    console.error('Post review error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

module.exports = router;

