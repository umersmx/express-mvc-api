const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Category = require('../src/models/Category');
const Course = require('../src/models/Course');

describe('Course Endpoints (/api/courses)', () => {
  let authToken;
  let sampleCategory;

  beforeEach(async () => {
    // Register and get token for protected endpoints
    const authRes = await request(app).post('/api/auth/register').send({
      name: 'Instructor Bob',
      email: 'instructor@example.com',
      password: 'password123',
    });
    authToken = authRes.body.data.token;

    // Create a base category for courses to reference
    sampleCategory = await Category.create({
      name: 'Computer Science',
      description: 'Foundational CS courses',
    });
  });

  describe('POST /api/courses (Protected)', () => {
    it('should create a new course when authenticated with valid data and existing category', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Data Structures and Algorithms',
          description: 'Master binary trees, graphs, sorting, and dynamic programming.',
          category: sampleCategory._id.toString(),
          price: 49.99,
          instructor: 'Dr. Turing',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe('Data Structures and Algorithms');
      expect(res.body.data.category).toHaveProperty('_id');
      expect(res.body.data.category.name).toBe('Computer Science');
    });

    it('should return 401 when creating course without authentication token', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'Algorithms',
          description: 'Master algorithms from scratch.',
          category: sampleCategory._id.toString(),
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when missing required fields (title, description, category)', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      const fields = res.body.errors.map((e) => e.field);
      expect(fields).toContain('title');
      expect(fields).toContain('description');
      expect(fields).toContain('category');
    });

    it('should return 400 when referenced category does not exist in database', async () => {
      const nonExistentCategoryId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Algorithms 101',
          description: 'Basic introduction to algorithms.',
          category: nonExistentCategoryId.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('does not exist');
    });

    it('should return 400 when category ID format is invalid/malformed', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Algorithms 101',
          description: 'Basic introduction to algorithms.',
          category: 'invalid-category-id',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'category')).toBe(true);
    });
  });

  describe('GET /api/courses (Public)', () => {
    beforeEach(async () => {
      await Course.create([
        {
          title: 'Introduction to Python',
          description: 'Learn Python programming language from the basics.',
          category: sampleCategory._id,
        },
        {
          title: 'Advanced React Development',
          description: 'Deep dive into React hooks, state management, and SSR.',
          category: sampleCategory._id,
        },
      ]);
    });

    it('should retrieve all courses with populated category', async () => {
      const res = await request(app).get('/api/courses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].category).toHaveProperty('name', 'Computer Science');
    });

    it('should filter courses by search keyword in title', async () => {
      const res = await request(app).get('/api/courses?search=Python');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Introduction to Python');
    });
  });

  describe('GET /api/courses/:id (Public)', () => {
    it('should retrieve a course by valid ID with populated category', async () => {
      const course = await Course.create({
        title: 'Operating Systems Principles',
        description: 'Explore processes, threads, memory paging, and file systems.',
        category: sampleCategory._id,
      });

      const res = await request(app).get(`/api/courses/${course._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Operating Systems Principles');
      expect(res.body.data.category.name).toBe('Computer Science');
    });

    it('should return 404 for validly formatted nonexistent course ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/courses/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for malformed course ID', async () => {
      const res = await request(app).get('/api/courses/not-a-valid-object-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid ID format');
    });
  });

  describe('PUT /api/courses/:id (Protected)', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create({
        title: 'Original Course Title',
        description: 'Original course description with sufficient length.',
        category: sampleCategory._id,
        price: 10,
      });
    });

    it('should update course fields when authenticated', async () => {
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Course Title',
          price: 29.99,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Course Title');
      expect(res.body.data.price).toBe(29.99);
    });

    it('should return 400 if updating category to a nonexistent category ID', async () => {
      const nonExistentCatId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: nonExistentCatId.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('does not exist');
    });

    it('should return 404 when updating nonexistent course', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/courses/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Course Title' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when updating without authentication token', async () => {
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .send({ title: 'Unauthorized Update' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/courses/:id (Protected)', () => {
    it('should delete a course when authenticated', async () => {
      const course = await Course.create({
        title: 'Course to Delete',
        description: 'Course description for deletion test case.',
        category: sampleCategory._id,
      });

      const res = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const found = await Course.findById(course._id);
      expect(found).toBeNull();
    });

    it('should return 404 when deleting nonexistent course', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/courses/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when deleting without authentication', async () => {
      const course = await Course.create({
        title: 'Course without auth delete',
        description: 'Testing unauthorized delete scenario.',
        category: sampleCategory._id,
      });

      const res = await request(app).delete(`/api/courses/${course._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
