const request = require('supertest');
const express = require('express');
const studentsRoute = require('../routes/students');
const pool = require('../db/pool');

const app = express();
app.use(express.json());
app.use('/api/students', studentsRoute);

describe('Students API', () => {
  afterAll(async () => {
    await pool.end();
  });

  let createdId;

  it('POST /api/students – creates a student', async () => {
    const res = await request(app).post('/api/students').send({
      admission_no: 'STU001',
      name: 'John Doe',
      stream_id: null
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('John Doe');
    createdId = res.body.id;
  });

  it('GET /api/students – returns list', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /api/students/:id – updates', async () => {
    const res = await request(app).put(`/api/students/${createdId}`).send({
      admission_no: 'STU001',
      name: 'John Updated',
      stream_id: null
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('John Updated');
  });

  it('DELETE /api/students/:id – deletes', async () => {
    const res = await request(app).delete(`/api/students/${createdId}`);
    expect(res.statusCode).toBe(204);
  });
}, 10000); // global timeout for describe