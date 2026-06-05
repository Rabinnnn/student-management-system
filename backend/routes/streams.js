const router = require('express').Router();
const pool = require('../db/pool');

// GET all streams
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM class_streams ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single stream
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM class_streams WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stream not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create stream
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await pool.query(
      'INSERT INTO class_streams (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Stream name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update stream
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE class_streams SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stream not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE stream
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM class_streams WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Stream not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;