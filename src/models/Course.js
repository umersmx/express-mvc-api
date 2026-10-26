const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Course title must be at least 3 characters long'],
      maxlength: [120, 'Course title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      minlength: [10, 'Course description must be at least 10 characters long'],
      maxlength: [2000, 'Course description cannot exceed 2000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Course category is required'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Course price cannot be negative'],
    },
    instructor: {
      type: String,
      trim: true,
      default: 'Instructor',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.methods.toJSON = function () {
  const courseObj = this.toObject();
  delete courseObj.__v;
  return courseObj;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
