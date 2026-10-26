const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateObjectId,
  validateCategory,
} = require('../middleware/validateMiddleware');

// Public category routes
router.get('/', getAllCategories);
router.get('/:id', validateObjectId('id'), getCategoryById);

// Protected category routes (require authentication)
router.post('/', protect, validateCategory, createCategory);
router.put('/:id', protect, validateObjectId('id'), validateCategory, updateCategory);
router.delete('/:id', protect, validateObjectId('id'), deleteCategory);

module.exports = router;
