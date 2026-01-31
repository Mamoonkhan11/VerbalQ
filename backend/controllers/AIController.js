const History = require('../models/History');
const AppSettings = require('../models/AppSettings');
const asyncHandler = require('../middleware/asyncHandler');
const getMLClient = require('../services/mlClient');

class AIController {
  /**
   * Grammar check endpoint
   * POST /api/ai/grammar
   */
  grammarCheck = asyncHandler(async (req, res) => {
    const { text, language = 'en' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Language is required and must be a valid language code'
      });
    }

    // Check if feature is enabled
    const settings = await AppSettings.getOrCreate();
    if (!settings.grammarEnabled) {
      return res.status(403).json({
        success: false,
        message: 'This feature is currently disabled by admin'
      });
    }

    try {
      // Get ML client instance
      const mlClient = getMLClient();

      // Call ML service through client
      const mlData = await mlClient.grammarCheck({
        text: text.trim(),
        language: language
      });

      // Save to history and limit records
      await this.saveToHistoryAndLimit(req.user._id, 'grammar', text.trim(), mlData.corrected_text, {
        inputLength: text.length,
        outputLength: mlData.corrected_text.length,
        issuesCount: mlData.issues.length,
        language: language
      });

      res.json({
        success: true,
        message: 'Grammar check completed successfully',
        data: {
          originalText: text,
          correctedText: mlData.corrected_text,
          issues: mlData.issues,
          language: language
        }
      });

    } catch (error) {
      console.error('Grammar check error:', error.message);

      // Handle specific ML service errors
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.data?.detail?.error || 'GRAMMAR_ERROR',
          message: error.message
        });
      }

      // Return generic error for other issues
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request.'
      });
    }
  });

  /**
   * Text translation endpoint
   * POST /api/ai/translate
   */
  translateText = asyncHandler(async (req, res) => {
    const { text, sourceLanguage = 'en', targetLanguage } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (!sourceLanguage || typeof sourceLanguage !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Source language is required and must be a valid language code'
      });
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Target language is required and must be a valid language code'
      });
    }

    // Check if feature is enabled
    const settings = await AppSettings.getOrCreate();
    if (!settings.translationEnabled) {
      return res.status(403).json({
        success: false,
        message: 'This feature is currently disabled by admin'
      });
    }

    try {
      // Get ML client instance
      const mlClient = getMLClient();

      // Call ML service through client
      const mlData = await mlClient.translate({
        text: text.trim(),
        source_lang: sourceLanguage,
        target_lang: targetLanguage
      });

      // Save to history and limit records
      await this.saveToHistoryAndLimit(req.user._id, 'translate', text.trim(), mlData.translated_text, {
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        inputLength: text.length,
        outputLength: mlData.translated_text.length
      });

      res.json({
        success: true,
        message: 'Translation completed successfully',
        data: {
          originalText: text,
          translatedText: mlData.translated_text,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          confidence: 0.95
        }
      });

    } catch (error) {
      console.error('Translation error:', error.message);

      // Handle specific ML service errors
      if (error.status) {
        const errorData = error.data?.detail || {};
        return res.status(error.status).json({
          success: false,
          error: errorData.error || 'TRANSLATION_ERROR',
          message: error.message
        });
      }

      // Return generic error for other issues
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request.'
      });
    }
  });

  /**
   * Text humanization endpoint
   * POST /api/ai/humanize
   */
  humanizeText = asyncHandler(async (req, res) => {
    const { text, language = 'en' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Language is required and must be a valid language code'
      });
    }

    // Check if feature is enabled
    const settings = await AppSettings.getOrCreate();
    if (!settings.humanizeEnabled) {
      return res.status(403).json({
        success: false,
        message: 'This feature is currently disabled by admin'
      });
    }

    try {
      // Get ML client instance
      const mlClient = getMLClient();

      // Call ML service through client
      const mlData = await mlClient.humanize({
        text: text.trim(),
        tone: 'casual', // Default tone, could be made configurable
        language: language
      });

      // Save to history and limit records
      await this.saveToHistoryAndLimit(req.user._id, 'humanize', text.trim(), mlData.rewritten_text, {
        inputLength: text.length,
        outputLength: mlData.rewritten_text.length,
        tone: mlData.tone,
        language: language,
        humanizationLevel: 'medium'
      });

      res.json({
        success: true,
        message: 'Text humanization completed successfully',
        data: {
          originalText: text,
          humanizedText: mlData.rewritten_text,
          tone: mlData.tone,
          language: language,
          changes: ['Improved sentence flow', 'Added natural transitions']
        }
      });

    } catch (error) {
      console.error('Humanization error:', error.message);

      // Handle specific ML service errors
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.data?.detail?.error || 'HUMANIZE_ERROR',
          message: error.message
        });
      }

      // Return generic error for other issues
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request.'
      });
    }
  });

  /**
   * Plagiarism check endpoint
   * POST /api/ai/plagiarism
   */
  plagiarismCheck = asyncHandler(async (req, res) => {
    const { text, language = 'en' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Language is required and must be a valid language code'
      });
    }

    // Check if feature is enabled
    const settings = await AppSettings.getOrCreate();
    if (!settings.plagiarismEnabled) {
      return res.status(403).json({
        success: false,
        message: 'This feature is currently disabled by admin'
      });
    }

    try {
      // Get ML client instance
      const mlClient = getMLClient();

      // Call ML service through client
      const mlData = await mlClient.plagiarismCheck({
        text: text.trim(),
        language: language
      });

      // Save to history and limit records
      const resultSummary = `Plagiarism analysis completed. Score: ${mlData.similarity_score}%`;
      await this.saveToHistoryAndLimit(req.user._id, 'plagiarism', text.trim(), resultSummary, {
        plagiarismScore: mlData.similarity_score,
        isPlagiarized: mlData.is_plagiarized,
        inputLength: text.length,
        language: language,
        matchesCount: mlData.matched_sentences.length
      });

      res.json({
        success: true,
        message: 'Plagiarism check completed successfully',
        data: {
          text: text.trim(),
          plagiarismScore: mlData.similarity_score,
          isPlagiarized: mlData.is_plagiarized,
          matches: mlData.matched_sentences,
          language: language,
          recommendation: mlData.is_plagiarized ? 'Consider rephrasing the content' : 'Content appears original'
        }
      });

    } catch (error) {
      console.error('Plagiarism check error:', error.message);

      // Handle specific ML service errors
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          error: error.data?.detail?.error || 'PLAGIARISM_ERROR',
          message: error.message
        });
      }

      // Return generic error for other issues
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request.'
      });
    }
  });

  getLanguages = asyncHandler(async (req, res) => {
    try {
      const mlClient = getMLClient();
      const mlData = await mlClient.client.get('/languages');
      
      res.json(mlData.data);
    } catch (error) {
      console.error('Failed to fetch languages:', error.message);
      // Fallback if ML service is down
      const fallbackLanguages = [
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
        languages: fallbackLanguages,
        message: 'Using fallback languages - ML service unavailable'
      });
    }
  });

  /**
   * Get supported translation languages
   * GET /api/ai/languages/translation
   */
  getTranslationLanguages = asyncHandler(async (req, res) => {
    try {
      const mlClient = getMLClient();
      const mlData = await mlClient.client.get('/translate/languages');
      
      res.json(mlData.data);
    } catch (error) {
      console.error('Failed to fetch translation languages:', error.message);
      // Fallback if ML service is down - provide common language pairs
      const fallbackPairs = [
        { from: 'en', to: 'es' },
        { from: 'en', to: 'fr' },
        { from: 'en', to: 'de' },
        { from: 'en', to: 'hi' },
        { from: 'en', to: 'ar' },
        { from: 'en', to: 'zh' },
        { from: 'en', to: 'ko' },
        { from: 'es', to: 'en' },
        { from: 'fr', to: 'en' },
        { from: 'de', to: 'en' },
        { from: 'hi', to: 'en' },
        { from: 'ar', to: 'en' },
        { from: 'zh', to: 'en' },
        { from: 'ko', to: 'en' }
      ];
      
      res.json({
        success: true,
        supportedPairs: fallbackPairs,
        message: 'Using fallback language pairs - ML service unavailable'
      });
    }
  });

  /**
   * Save to history and limit records to 100 per user
   * Automatically deletes oldest records when limit is exceeded
   */
  saveToHistoryAndLimit = async (userId, actionType, inputText, outputText, metaData) => {
    // Save the new record
    await History.create({
      userId,
      actionType,
      inputText,
      outputText,
      metaData
    });

    // Check and limit to 100 records per user
    const userHistoryCount = await History.countDocuments({ userId });
    if (userHistoryCount > 100) {
      // Delete oldest records, keeping only the latest 100
      const recordsToDelete = userHistoryCount - 100;
      const oldestRecords = await History.find({ userId })
        .sort({ createdAt: 1 })
        .limit(recordsToDelete)
        .select('_id');

      const recordIdsToDelete = oldestRecords.map(record => record._id);
      await History.deleteMany({ _id: { $in: recordIdsToDelete } });
    }
  };
}

module.exports = new AIController();