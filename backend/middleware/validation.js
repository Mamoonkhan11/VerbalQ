const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * Returns formatted error messages if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

/**
 * Validation rules for grammar check
 */
const validateGrammarCheck = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Text must be between 1 and 10,000 characters')
    .notEmpty()
    .withMessage('Text is required for grammar checking'),

  handleValidationErrors
];

/**
 * Validation rules for text translation
 */
const validateTranslation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Text must be between 1 and 10,000 characters')
    .notEmpty()
    .withMessage('Text is required for translation'),

  body('targetLanguage')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Target language must be a valid language code'),

  handleValidationErrors
];

/**
 * Validation rules for text humanization
 */
const validateHumanization = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Text must be between 1 and 10,000 characters')
    .notEmpty()
    .withMessage('Text is required for humanization'),

  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be a valid language code'),

  body('tone')
    .optional()
    .isIn(['casual', 'professional', 'academic', 'creative'])
    .withMessage('Tone must be one of: casual, professional, academic, creative'),

  handleValidationErrors
];

/**
 * Validation rules for AI text detection
 */
const validateAIDetection = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Text must be between 1 and 5,000 characters')
    .notEmpty()
    .withMessage('Text is required for AI detection'),

  handleValidationErrors
];

/**
 * Validation rules for plagiarism check
 */
const validatePlagiarismCheck = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Text must be between 1 and 10,000 characters')
    .notEmpty()
    .withMessage('Text is required for plagiarism checking'),

  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateGrammarCheck,
  validateTranslation,
  validateHumanization,
  validateAIDetection,
  validatePlagiarismCheck
};