const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateObjectId,
  validateCourse,
  validateCourseUpdate,
} = require('../middleware/validateMiddleware');

// Public course routes
router.get('/', getAllCourses);
router.get('/:id', validateObjectId('id'), getCourseById);

// Protected course routes (require authentication)
router.post('/', protect, validateCourse, createCourse);
router.put('/:id', protect, validateObjectId('id'), validateCourseUpdate, updateCourse);
router.delete('/:id', protect, validateObjectId('id'), deleteCourse);

module.exports = router;
