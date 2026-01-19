const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  grammarEnabled: {
    type: Boolean,
    default: true
  },
  translationEnabled: {
    type: Boolean,
    default: true
  },
  humanizeEnabled: {
    type: Boolean,
    default: true
  },
  plagiarismEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
appSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingSettings = await this.constructor.findOne();
    if (existingSettings) {
      const error = new Error('Only one AppSettings document is allowed');
      return next(error);
    }
  }
  next();
});

// Static method to get or create default settings
appSettingsSchema.statics.getOrCreate = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('AppSettings', appSettingsSchema);