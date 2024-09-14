const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../db');

const router = express.Router();

router.post('/add-product', auth, async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ message: 'Access denied' });

  const { name, category, description, price, discount } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO products (name, category, description, price, discount, seller_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, category, description, price, discount, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

router.put('/edit-product/:id', auth, async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ message: 'Access denied' });

  const { id } = req.params;
  const { name, category, description, price, discount } = req.body;

  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, description = $3, price = $4, discount = $5 WHERE id = $6 AND seller_id = $7 RETURNING *',
      [name, category, description, price, discount, id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit product' });
  }
});

router.delete('/delete-product/:id', auth, async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ message: 'Access denied' });

  const { id } = req.params;

  try {
    await pool.query('DELETE FROM products WHERE id = $1 AND seller_id = $2', [id, req.user.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
