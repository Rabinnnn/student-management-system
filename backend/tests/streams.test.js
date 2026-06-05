const request = require('supertest');
const express = require('express');
const streamsRoute = require('../routes/streams');
const pool = require('../db/pool');

const app = express();
app.use(express.json());
app.use('/api/streams', streamsRoute);

describe('Class Streams API', () => {
  afterAll(async () => {
    await pool.end();
  });

  let createdId;

  it('POST /api/streams – creates a stream', async () => {
    const res = await request(app).post('/api/streams').send({ name: 'Form 1A' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Form 1A');
    createdId = res.body.id;
  });

  it('GET /api/streams – returns list', async () => {
    const res = await request(app).get('/api/streams');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /api/streams/:id – updates', async () => {
    const res = await request(app).put(`/api/streams/${createdId}`).send({ name: 'Form 1B' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Form 1B');
  });

  it('DELETE /api/streams/:id – deletes', async () => {
    const res = await request(app).delete(`/api/streams/${createdId}`);
    expect(res.statusCode).toBe(204);
  });
});