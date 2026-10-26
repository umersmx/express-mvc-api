const Category = require('../models/Category');
const Course = require('../models/Course');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check if category name already exists (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existingCategory) {
      return sendError(
        res,
        400,
        `A category named '${name}' already exists`
      );
    }

    const category = await Category.create({
      name,
      description: description || '',
      createdBy: req.user._id,
    });

    return sendSuccess(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    return sendSuccess(
      res,
      200,
      'Categories retrieved successfully',
      categories,
      { count: categories.length }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(
        res,
        404,
        `Category not found with ID '${req.params.id}'`
      );
    }

    return sendSuccess(res, 200, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category by ID
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(
        res,
        404,
        `Category not found with ID '${req.params.id}'`
      );
    }

    const { name, description } = req.body;

    // If name is changing, check uniqueness against other categories
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (duplicate) {
        return sendError(
          res,
          400,
          `Another category with the name '${name}' already exists`
        );
      }
      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    const updatedCategory = await category.save();

    return sendSuccess(
      res,
      200,
      'Category updated successfully',
      updatedCategory
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category by ID
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(
        res,
        404,
        `Category not found with ID '${req.params.id}'`
      );
    }

    // REQUIREMENT 7: Prevent deletion of a category that still has courses
    const associatedCoursesCount = await Course.countDocuments({
      category: req.params.id,
    });

    if (associatedCoursesCount > 0) {
      return sendError(
        res,
        400,
        `Cannot delete category '${category.name}': It is referenced by ${associatedCoursesCount} active course(s). Please reassign or delete these courses first.`
      );
    }

    await category.deleteOne();

    return sendSuccess(
      res,
      200,
      `Category '${category.name}' deleted successfully`,
      null
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
