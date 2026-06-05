const router = require('express').Router();
const pool = require('../db/pool');

// GET all subjects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single subject
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create subject
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    const result = await pool.query(
      'INSERT INTO subjects (name, code) VALUES ($1, $2) RETURNING *',
      [name, code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Subject code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const result = await pool.query(
      'UPDATE subjects SET name = $1, code = $2 WHERE id = $3 RETURNING *',
      [name, code, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subject not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET subjects assigned to a stream
router.get('/stream/:streamId', async (req, res) => {
  try {
    const { streamId } = req.params;
    const result = await pool.query(
      `SELECT s.* FROM subjects s
       JOIN stream_subjects ss ON s.id = ss.subject_id
       WHERE ss.stream_id = $1
       ORDER BY s.name`,
      [streamId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST assign subject to stream
router.post('/assign', async (req, res) => {
  try {
    const { streamId, subjectId } = req.body;
    if (!streamId || !subjectId) return res.status(400).json({ error: 'streamId and subjectId required' });
    await pool.query(
      'INSERT INTO stream_subjects (stream_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [streamId, subjectId]
    );
    res.status(201).json({ message: 'Subject assigned to stream' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove subject from stream
router.delete('/assign', async (req, res) => {
  try {
    const { streamId, subjectId } = req.body;
    await pool.query(
      'DELETE FROM stream_subjects WHERE stream_id = $1 AND subject_id = $2',
      [streamId, subjectId]
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;