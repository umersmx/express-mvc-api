const request = require('supertest');
const app = require('../src/app');

describe('System Error Handling & Edge Cases', () => {
  it('should return 404 for unknown URLs with standardized error structure', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Endpoint not found');
  });

  it('should return 404 for unknown POST URLs', async () => {
    const res = await request(app)
      .post('/api/unknown/resource')
      .send({ data: 123 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when token is improperly formatted', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'NotBearerToken');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No authentication token provided');
  });

  it('should return 401 when token has been tampered with', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid authentication token');
  });

  it('should return 200 for root welcome endpoint', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('version');
    expect(res.body.data).toHaveProperty('endpoints');
  });

  it('should return 200 for health check endpoint', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('uptime');
  });
});
