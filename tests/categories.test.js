const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Category = require('../src/models/Category');
const Course = require('../src/models/Course');

describe('Category Endpoints (/api/categories)', () => {
  let authToken;

  beforeEach(async () => {
    // Register and get token for protected endpoints
    const authRes = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
    });
    authToken = authRes.body.data.token;
  });

  describe('POST /api/categories (Protected)', () => {
    it('should create a new category when authenticated', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Web Development',
          description: 'Frontend and Backend web development courses',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe('Web Development');
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({
          name: 'Mobile Development',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when category name is missing', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing name category',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when creating duplicate category name', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Data Science' });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Data Science' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('GET /api/categories (Public)', () => {
    it('should retrieve all categories', async () => {
      await Category.create([
        { name: 'Category 1' },
        { name: 'Category 2' },
      ]);

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('GET /api/categories/:id (Public)', () => {
    it('should retrieve a category by valid ID', async () => {
      const category = await Category.create({ name: 'Cybersecurity' });

      const res = await request(app).get(`/api/categories/${category._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Cybersecurity');
    });

    it('should return 404 for validly formatted nonexistent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/categories/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for malformed ID', async () => {
      const res = await request(app).get('/api/categories/not-a-valid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid ID format');
    });
  });

  describe('PUT /api/categories/:id (Protected)', () => {
    it('should update a category when authenticated', async () => {
      const category = await Category.create({ name: 'Old Name' });

      const res = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Name',
          description: 'Updated Description',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Name');
    });

    it('should return 401 when updating without authentication', async () => {
      const category = await Category.create({ name: 'DevOps' });

      const res = await request(app)
        .put(`/api/categories/${category._id}`)
        .send({ name: 'DevOps & SRE' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when updating nonexistent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Any Name' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id (Protected)', () => {
    it('should delete a category with no associated courses', async () => {
      const category = await Category.create({ name: 'To Be Deleted' });

      const res = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const found = await Category.findById(category._id);
      expect(found).toBeNull();
    });

    it('should return 400 and PREVENT deletion if category still has associated courses', async () => {
      const category = await Category.create({ name: 'Web Development' });
      await Course.create({
        title: 'Full Stack Node.js',
        description: 'Comprehensive course on Node, Express and MongoDB',
        category: category._id,
      });

      const res = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('active course(s)');

      // Verify category still exists in database
      const categoryStillExists = await Category.findById(category._id);
      expect(categoryStillExists).not.toBeNull();
    });

    it('should return 404 when deleting nonexistent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when deleting without authentication', async () => {
      const category = await Category.create({ name: 'Machine Learning' });

      const res = await request(app).delete(`/api/categories/${category._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
