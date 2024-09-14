const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../db');

const router = express.Router();

router.get('/search', auth, async (req, res) => {
  const { name, category } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE name ILIKE $1 OR category ILIKE $2',
      [`%${name}%`, `%${category}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/add-to-cart', auth, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ message: 'Access denied' });

  const { productId } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO carts (buyer_id, product_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, productId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.delete('/remove-from-cart/:id', auth, async (req, res) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ message: 'Access denied' });

  const { id } = req.params;

  try {
    await pool.query('DELETE FROM carts WHERE id = $1 AND buyer_id = $2', [id, req.user.id]);
    res.json({ message: 'Product removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

module.exports = router;
