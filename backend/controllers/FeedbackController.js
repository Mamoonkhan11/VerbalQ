const Feedback = require('../models/Feedback');
const asyncHandler = require('../middleware/asyncHandler');

class FeedbackController {
  /**
   * Submit feedback
   * POST /api/feedback
   * Public
   */
  submitFeedback = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    const feedback = await Feedback.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  });

  /**
   * Get all feedback (Admin only)
   * GET /api/feedback
   */
  getAllFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: feedback
    });
  });
}

module.exports = new FeedbackController();
