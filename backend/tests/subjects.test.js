const request = require('supertest');
const express = require('express');
const subjectsRoute = require('../routes/subjects');
const pool = require('../db/pool');

const app = express();
app.use(express.json());
app.use('/api/subjects', subjectsRoute);

describe('Subjects API', () => {
  afterAll(async () => {
    await pool.end();
  });

  let createdId;

  it('POST /api/subjects – creates a subject', async () => {
    const res = await request(app).post('/api/subjects').send({ name: 'Mathematics', code: 'MATH101' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Mathematics');
    createdId = res.body.id;
  });

  it('GET /api/subjects – returns list', async () => {
    const res = await request(app).get('/api/subjects');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /api/subjects/:id – updates', async () => {
    const res = await request(app).put(`/api/subjects/${createdId}`).send({ name: 'Advanced Math', code: 'MATH201' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Advanced Math');
  });

  it('DELETE /api/subjects/:id – deletes', async () => {
    const res = await request(app).delete(`/api/subjects/${createdId}`);
    expect(res.statusCode).toBe(204);
  });
});