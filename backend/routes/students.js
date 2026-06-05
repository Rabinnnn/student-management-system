const router = require('express').Router();
const pool = require('../db/pool');

// GET all students (with optional stream filter)
router.get('/', async (req, res) => {
  try {
    const { streamId } = req.query;
    let query = `
      SELECT s.*, c.name as stream_name 
      FROM students s
      LEFT JOIN class_streams c ON s.stream_id = c.id
    `;
    let params = [];
    if (streamId) {
      query += ' WHERE s.stream_id = $1';
      params.push(streamId);
    }
    query += ' ORDER BY s.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, c.name as stream_name 
       FROM students s
       LEFT JOIN class_streams c ON s.stream_id = c.id
       WHERE s.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create student
router.post('/', async (req, res) => {
  try {
    const { admission_no, name, stream_id } = req.body;
    if (!admission_no || !name) return res.status(400).json({ error: 'Admission number and name are required' });
    const result = await pool.query(
      'INSERT INTO students (admission_no, name, stream_id) VALUES ($1, $2, $3) RETURNING *',
      [admission_no, name, stream_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Admission number already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { admission_no, name, stream_id } = req.body;
    const result = await pool.query(
      `UPDATE students 
       SET admission_no = $1, name = $2, stream_id = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [admission_no, name, stream_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;