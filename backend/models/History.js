const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  actionType: {
    type: String,
    enum: ['grammar', 'translate', 'humanize', 'plagiarism'],
    required: [true, 'Action type is required']
  },
  inputText: {
    type: String,
    required: [true, 'Input text is required'],
    maxlength: [10000, 'Input text cannot exceed 10,000 characters']
  },
  outputText: {
    type: String,
    required: [true, 'Output text is required'],
    maxlength: [10000, 'Output text cannot exceed 10,000 characters']
  },
  metaData: {
    type: mongoose.Schema.Types.Mixed, // Flexible object for additional data
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for efficient queries
historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ actionType: 1 });
historySchema.index({ createdAt: -1 });

module.exports = mongoose.model('History', historySchema);