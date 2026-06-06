const router = require('express').Router();
const pool = require('../db/pool');

// POST or PUT (upsert) – record or update score
router.post('/', async (req, res) => {
  try {
    const { student_id, subject_id, academic_term, exam_score, continuous_score } = req.body;

    if (!student_id || !subject_id || !academic_term) {
      return res.status(400).json({ error: 'student_id, subject_id, and academic_term are required' });
    }

    const exam = exam_score !== undefined ? parseFloat(exam_score) : null;
    const continuous = continuous_score !== undefined ? parseFloat(continuous_score) : null;

    if (exam !== null && (isNaN(exam) || exam < 0 || exam > 100)) {
      return res.status(400).json({ error: 'Exam score must be between 0 and 100' });
    }
    if (continuous !== null && (isNaN(continuous) || continuous < 0 || continuous > 100)) {
      return res.status(400).json({ error: 'Continuous score must be between 0 and 100' });
    }

    // Upsert – total_score will be auto-calculated by the database
    const result = await pool.query(
      `INSERT INTO assessments (student_id, subject_id, academic_term, exam_score, continuous_score)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, subject_id, academic_term)
       DO UPDATE SET 
         exam_score = EXCLUDED.exam_score,
         continuous_score = EXCLUDED.continuous_score
       RETURNING *`,
      [student_id, subject_id, academic_term, exam, continuous]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET scores for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'term query parameter is required' });

    const result = await pool.query(
      `SELECT a.*, s.name as subject_name, s.code as subject_code
       FROM assessments a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.student_id = $1 AND a.academic_term = $2
       ORDER BY s.name`,
      [studentId, term]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET scores for a class stream, subject, term
router.get('/stream/:streamId/subject/:subjectId', async (req, res) => {
  try {
    const { streamId, subjectId } = req.params;
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'term query parameter is required' });

    const result = await pool.query(
      `SELECT 
         s.id as student_id, s.admission_no, s.name as student_name,
         a.exam_score, a.continuous_score, a.total_score
       FROM students s
       LEFT JOIN assessments a ON a.student_id = s.id AND a.subject_id = $2 AND a.academic_term = $3
       WHERE s.stream_id = $1
       ORDER BY a.total_score DESC NULLS LAST`,
      [streamId, subjectId, term]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all distinct terms
router.get('/terms', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT academic_term FROM assessments ORDER BY academic_term DESC');
    res.json(result.rows.map(r => r.academic_term));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;