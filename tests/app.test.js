const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('should return 200 and a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Hello World');
  });
});

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /add', () => {
  it('should correctly add two numbers', async () => {
    const res = await request(app).get('/add?a=5&b=7');
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(12);
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app).get('/add?a=hello&b=7');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
