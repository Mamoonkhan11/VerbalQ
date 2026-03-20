const mongoose = require('mongoose');

/**
 * Guest Usage Tracking Model
 * 
 * Tracks usage of guests (non-authenticated users) to enforce the 3-use limit.
 * Automatically expires after 30 days of inactivity.
 */
const GuestUsageSchema = new mongoose.Schema({
  identifier: {
    type: String,  // IP address or device fingerprint
    required: true,
    unique: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
    validate: {
      validator: function(value) {
        return value <= 3;
      },
      message: 'Guest usage cannot exceed 3'
    }
  },
  usageHistory: [{
    serviceType: {
      type: String,
      enum: ['grammar', 'translate', 'humanize'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000  // Auto-delete after 30 days (in seconds)
  }
});

// Index for efficient queries
GuestUsageSchema.index({ identifier: 1 });
GuestUsageSchema.index({ createdAt: 1, expireAfterSeconds: 30 });

// Update lastUsed before saving
GuestUsageSchema.pre('save', function(next) {
  this.lastUsed = new Date();
  next();
});

// Instance method to check if limit reached
GuestUsageSchema.methods.hasReachedLimit = function() {
  return this.usageCount >= 3;
};

// Instance method to increment usage
GuestUsageSchema.methods.incrementUsage = function(serviceType) {
  if (this.usageCount >= 3) {
    throw new Error('Guest usage limit reached');
  }
  
  this.usageCount += 1;
  this.usageHistory.push({
    serviceType,
    timestamp: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('GuestUsage', GuestUsageSchema);
