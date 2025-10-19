const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide book title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please provide subject'],
    trim: true,
    maxlength: [50, 'Subject cannot be more than 50 characters']
  },
  totalChapters: {
    type: Number,
    required: [true, 'Please provide total chapters'],
    min: [1, 'Total chapters must be at least 1']
  },
  completedChapters: {
    type: Number,
    default: 0,
    min: [0, 'Completed chapters cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
bookSchema.virtual('progressPercentage').get(function() {
  return Math.round((this.completedChapters / this.totalChapters) * 100);
});

// Ensure completed chapters don't exceed total chapters
bookSchema.pre('save', function(next) {
  if (this.completedChapters > this.totalChapters) {
    this.completedChapters = this.totalChapters;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
