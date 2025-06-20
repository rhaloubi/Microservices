const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Teacher ID is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);