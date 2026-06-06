const request = require('supertest');
const express = require('express');
const assessmentsRoute = require('../routes/assessments');
const pool = require('../db/pool');

const app = express();
app.use(express.json());
app.use('/api/assessments', assessmentsRoute);

describe('Assessments API', () => {
  let studentId, subjectId;

  beforeAll(async () => {
    const studentRes = await pool.query(
      `INSERT INTO students (admission_no, name) VALUES ('TEST001', 'Test Student') RETURNING id`
    );
    studentId = studentRes.rows[0].id;
    const subjectRes = await pool.query(
      `INSERT INTO subjects (name, code) VALUES ('Test Subject', 'TEST01') ON CONFLICT DO NOTHING RETURNING id`
    );
    subjectId = subjectRes.rows[0] ? subjectRes.rows[0].id : (await pool.query(`SELECT id FROM subjects WHERE code='TEST01'`)).rows[0].id;
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM students WHERE admission_no = 'TEST001'`);
    await pool.query(`DELETE FROM subjects WHERE code = 'TEST01'`);
    await pool.end();
  });

  it('POST /api/assessments – creates a score record', async () => {
    const res = await request(app).post('/api/assessments').send({
      student_id: studentId,
      subject_id: subjectId,
      academic_term: 'Term 1 2025',
      exam_score: 75,
      continuous_score: 20
    });
    expect(res.statusCode).toBe(201);
    expect(parseFloat(res.body.total_score)).toBe(95);
  });

  it('POST /api/assessments – prevents duplicate (updates instead)', async () => {
    const res = await request(app).post('/api/assessments').send({
      student_id: studentId,
      subject_id: subjectId,
      academic_term: 'Term 1 2025',
      exam_score: 80,
      continuous_score: 18
    });
    expect(res.statusCode).toBe(201);
    expect(parseFloat(res.body.total_score)).toBe(98);
  });

  it('GET /api/assessments/student/:studentId?term=... – returns scores', async () => {
    const res = await request(app).get(`/api/assessments/student/${studentId}?term=Term 1 2025`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].subject_name).toBe('Test Subject');
  });
});