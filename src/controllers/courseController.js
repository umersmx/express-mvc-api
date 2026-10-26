const Course = require('../models/Course');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private
 */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, instructor } = req.body;

    // Verify that referenced category exists in database
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return sendError(
        res,
        400,
        `Referenced category with ID '${category}' does not exist`
      );
    }

    const course = await Course.create({
      title,
      description,
      category,
      price: price !== undefined ? price : 0,
      instructor: instructor || req.user.name,
      createdBy: req.user._id,
    });

    // Populate category details for response
    await course.populate('category', 'name description');

    return sendSuccess(res, 201, 'Course created successfully', course);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all courses with optional category filter and keyword search
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res, next) => {
  try {
    const filter = {};

    // Optional query filtering
    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const courses = await Course.find(filter)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(
      res,
      200,
      'Courses retrieved successfully',
      courses,
      { count: courses.length }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email');

    if (!course) {
      return sendError(
        res,
        404,
        `Course not found with ID '${req.params.id}'`
      );
    }

    return sendSuccess(res, 200, 'Course retrieved successfully', course);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a course by ID
 * @route   PUT /api/courses/:id
 * @access  Private
 */
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return sendError(
        res,
        404,
        `Course not found with ID '${req.params.id}'`
      );
    }

    const { title, description, category, price, instructor } = req.body;

    // If category is being updated, verify new category exists
    if (category && category !== course.category.toString()) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return sendError(
          res,
          400,
          `Referenced category with ID '${category}' does not exist`
        );
      }
      course.category = category;
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = price;
    if (instructor !== undefined) course.instructor = instructor;

    const updatedCourse = await course.save();
    await updatedCourse.populate('category', 'name description');

    return sendSuccess(
      res,
      200,
      'Course updated successfully',
      updatedCourse
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a course by ID
 * @route   DELETE /api/courses/:id
 * @access  Private
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return sendError(
        res,
        404,
        `Course not found with ID '${req.params.id}'`
      );
    }

    await course.deleteOne();

    return sendSuccess(
      res,
      200,
      `Course '${course.title}' deleted successfully`,
      null
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
