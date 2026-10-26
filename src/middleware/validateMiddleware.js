const mongoose = require('mongoose');
const { sendError } = require('../utils/apiResponse');

/**
 * Validate MongoDB ObjectId format in route parameters
 * @param {string} paramName - Parameter name in req.params (defaults to 'id')
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        400,
        `Invalid ID format for parameter '${paramName}'. Must be a 24-character hexadecimal string.`
      );
    }
    next();
  };
};

/**
 * Validate User Registration input
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed: Please provide all required fields correctly', errors);
  }

  // Sanitize
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Validate User Login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed: Email and password are required', errors);
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate Category creation and full update
 */
const validateCategory = (req, res, next) => {
  const { name, description } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Category name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Category name must be at least 2 characters long' });
  } else if (name.trim().length > 60) {
    errors.push({ field: 'name', message: 'Category name cannot exceed 60 characters' });
  }

  if (description !== undefined && typeof description === 'string' && description.length > 500) {
    errors.push({ field: 'description', message: 'Description cannot exceed 500 characters' });
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body.name = name.trim();
  if (description) req.body.description = description.trim();

  next();
};

/**
 * Validate Course creation
 */
const validateCourse = (req, res, next) => {
  const { title, description, category, price, instructor } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Course title is required' });
  } else if (title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Course title must be at least 3 characters long' });
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Course description is required' });
  } else if (description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Course description must be at least 10 characters long' });
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Category ID is required' });
  } else if (!mongoose.Types.ObjectId.isValid(category.trim())) {
    errors.push({ field: 'category', message: 'Category ID format is invalid' });
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push({ field: 'price', message: 'Price must be a non-negative number' });
    }
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body.title = title.trim();
  req.body.description = description.trim();
  req.body.category = category.trim();
  if (price !== undefined) req.body.price = Number(price);
  if (instructor && typeof instructor === 'string') req.body.instructor = instructor.trim();

  next();
};

/**
 * Validate Course update (partial allowed)
 */
const validateCourseUpdate = (req, res, next) => {
  const { title, description, category, price, instructor } = req.body;
  const errors = [];

  if (
    title === undefined &&
    description === undefined &&
    category === undefined &&
    price === undefined &&
    instructor === undefined
  ) {
    return sendError(res, 400, 'Validation failed: Please provide at least one field to update');
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Course title must be at least 3 characters long' });
    } else {
      req.body.title = title.trim();
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Course description must be at least 10 characters long' });
    } else {
      req.body.description = description.trim();
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || !mongoose.Types.ObjectId.isValid(category.trim())) {
      errors.push({ field: 'category', message: 'Category ID format is invalid' });
    } else {
      req.body.category = category.trim();
    }
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      errors.push({ field: 'price', message: 'Price must be a non-negative number' });
    } else {
      req.body.price = numPrice;
    }
  }

  if (instructor !== undefined && typeof instructor === 'string') {
    req.body.instructor = instructor.trim();
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  next();
};

module.exports = {
  validateObjectId,
  validateRegister,
  validateLogin,
  validateCategory,
  validateCourse,
  validateCourseUpdate,
};
