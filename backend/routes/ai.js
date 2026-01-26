const express = require('express');
const router = express.Router();
const aiController = require('../controllers/AIController');
const auth = require('../middleware/auth');
const { aiRateLimit } = require('../middleware/rateLimit');
const {
  validateGrammarCheck,
  validateTranslation,
  validateHumanization,
  validatePlagiarismCheck
} = require('../middleware/validation');

/**
 * AI Routes
 *
 * These routes implement the proxy pattern for AI services:
 * 1. Frontend calls these backend endpoints
 * 2. Backend validates requests and checks feature permissions
 * 3. Backend forwards requests to Python ML service
 * 4. Backend returns ML responses to frontend
 *
 * This ensures the ML service is never directly exposed to clients.
 */

// Apply rate limiting to all AI routes
router.use(aiRateLimit);

/**
 * @route   GET /api/ai/languages
 * @desc    Get list of supported languages
 * @access  Public (no auth required)
 */
router.get('/languages', (req, res) => {
  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' }
  ];

  res.json({
    success: true,
    languages: supportedLanguages
  });
});

/**
 * @route   GET /api/ai/languages/translation
 * @desc    Get supported translation pairs
 * @access  Public
 */
router.get('/languages/translation', aiController.getTranslationLanguages);

/**
 * @route   POST /api/ai/grammar
 * @desc    Check grammar of provided text
 * @access  Private (requires authentication)
 */
router.post('/grammar', auth, validateGrammarCheck, aiController.grammarCheck);

/**
 * @route   POST /api/ai/translate
 * @desc    Translate text to target language
 * @access  Private (requires authentication)
 */
router.post('/translate', auth, validateTranslation, aiController.translateText);

/**
 * @route   POST /api/ai/humanize
 * @desc    Humanize AI-generated text
 * @access  Private (requires authentication)
 */
router.post('/humanize', auth, validateHumanization, aiController.humanizeText);

/**
 * @route   POST /api/ai/plagiarism
 * @desc    Check text for plagiarism
 * @access  Private (requires authentication)
 */
router.post('/plagiarism', auth, validatePlagiarismCheck, aiController.plagiarismCheck);

module.exports = router;