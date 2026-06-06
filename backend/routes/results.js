const router = require('express').Router();
const pool = require('../db/pool');

// Get grading scale from database
async function getGrade(totalScore) {
  const res = await pool.query(
    `SELECT grade, remark FROM grading_scales 
     WHERE $1 BETWEEN min_score AND max_score LIMIT 1`,
    [totalScore]
  );
  return res.rows[0] || { grade: 'N/A', remark: 'Not graded' };
}

// Get overall student performance for a specific term
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'term is required' });

    // Get scores with subject details
    const scoresResult = await pool.query(
      `SELECT 
         a.subject_id, s.name as subject_name, s.code,
         a.exam_score, a.continuous_score, a.total_score
       FROM assessments a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.student_id = $1 AND a.academic_term = $2
       ORDER BY s.name`,
      [studentId, term]
    );

    const scores = scoresResult.rows;
    
    // Calculate totals and averages
    let totalMarks = 0;
    let totalSubjects = scores.length;
    scores.forEach(score => {
      totalMarks += parseFloat(score.total_score) || 0;
    });
    const averageScore = totalSubjects > 0 ? totalMarks / totalSubjects : 0;
    
    // Determine overall grade
    const gradeInfo = await getGrade(averageScore);
    
    // For each subject, get position within the stream
    // Need stream_id of student first
    const studentInfo = await pool.query(
      `SELECT stream_id FROM students WHERE id = $1`,
      [studentId]
    );
    const streamId = studentInfo.rows[0]?.stream_id;
    
    // Get subject positions (rank within stream for each subject)
    const positions = {};
    if (streamId) {
      for (const score of scores) {
        const posRes = await pool.query(
          `SELECT COUNT(*) + 1 as position FROM (
             SELECT DISTINCT ON (s.id) a.total_score
             FROM students s
             LEFT JOIN assessments a ON a.student_id = s.id 
                AND a.subject_id = $1 AND a.academic_term = $2
             WHERE s.stream_id = $3 AND a.total_score > $4
             ORDER BY s.id, a.total_score DESC
           ) as ranks`,
          [score.subject_id, term, streamId, score.total_score || 0]
        );
        positions[score.subject_id] = posRes.rows[0]?.position || scores.length;
      }
    }

    // Get overall class position
    let overallPosition = null;
    if (streamId && totalSubjects > 0) {
      const posRes = await pool.query(
        `SELECT position FROM (
           SELECT 
             s.id,
             RANK() OVER (ORDER BY COALESCE(SUM(a.total_score), 0) DESC) as position
           FROM students s
           LEFT JOIN assessments a ON a.student_id = s.id AND a.academic_term = $2
           WHERE s.stream_id = $1
           GROUP BY s.id
         ) ranks WHERE id = $3`,
        [streamId, term, studentId]
      );
      overallPosition = posRes.rows[0]?.position || null;
    }

    res.json({
      student_id: studentId,
      term,
      total_marks: totalMarks,
      average_score: parseFloat(averageScore.toFixed(2)),
      grade: gradeInfo.grade,
      remark: gradeInfo.remark,
      overall_position: overallPosition,
      subjects: scores.map(score => ({
        subject_id: score.subject_id,
        subject_name: score.subject_name,
        exam_score: score.exam_score,
        continuous_score: score.continuous_score,
        total_score: score.total_score,
        position: positions[score.subject_id] || null
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get class performance for a specific subject and term
router.get('/class/:streamId/subject/:subjectId', async (req, res) => {
  try {
    const { streamId, subjectId } = req.params;
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'term is required' });

    const result = await pool.query(
      `SELECT 
         s.id as student_id,
         s.admission_no,
         s.name as student_name,
         COALESCE(a.exam_score, 0) as exam_score,
         COALESCE(a.continuous_score, 0) as continuous_score,
         COALESCE(a.total_score, 0) as total_score,
         RANK() OVER (ORDER BY COALESCE(a.total_score, 0) DESC) as position
       FROM students s
       LEFT JOIN assessments a ON a.student_id = s.id 
          AND a.subject_id = $2 AND a.academic_term = $3
       WHERE s.stream_id = $1
       ORDER BY position`,
      [streamId, subjectId, term]
    );

    // Get subject name
    const subjectRes = await pool.query(`SELECT name, code FROM subjects WHERE id = $1`, [subjectId]);
    const subjectName = subjectRes.rows[0]?.name || 'Unknown';

    res.json({
      stream_id: streamId,
      subject_id: subjectId,
      subject_name: subjectName,
      term,
      students: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get overall class ranking (all subjects combined)
router.get('/class/:streamId/overall', async (req, res) => {
  try {
    const { streamId } = req.params;
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'term is required' });

    const result = await pool.query(
      `SELECT 
         s.id as student_id,
         s.admission_no,
         s.name as student_name,
         COALESCE(SUM(a.total_score), 0) as total_marks,
         COALESCE(ROUND(AVG(a.total_score), 2), 0) as average,
         RANK() OVER (ORDER BY COALESCE(SUM(a.total_score), 0) DESC) as position
       FROM students s
       LEFT JOIN assessments a ON a.student_id = s.id AND a.academic_term = $2
       WHERE s.stream_id = $1
       GROUP BY s.id, s.admission_no, s.name
       ORDER BY position`,
      [streamId, term]
    );

    res.json({
      stream_id: streamId,
      term,
      students: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;