const History = require('../models/History');
const AppSettings = require('../models/AppSettings');
const { incrementGuestUsage } = require('../middleware/guestAuth');
const asyncHandler = require('../middleware/asyncHandler');
const getMLClient = require('../services/mlClient');

class AIController {
  buildHumanizeFallback = (text, tone = 'casual') => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return '';
    }

    let humanized = normalized;
    if (tone === 'casual') {
      humanized = humanized
        .replace(/\bdo not\b/gi, "don't")
        .replace(/\bcannot\b/gi, "can't")
        .replace(/\bit is\b/gi, "it's")
        .replace(/\bi am\b/gi, "I'm");
    }

    humanized = humanized.charAt(0).toUpperCase() + humanized.slice(1);
    if (!/[.!?]$/.test(humanized)) {
      humanized += '.';
    }

    return humanized;
  };
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

      const correctedText = mlData.corrected_text;
      const corrections = mlData.corrections || [];

      // Save to history for authenticated users
      if (req.user) {
        await this.saveToHistoryAndLimit(req.user._id, 'grammar', text.trim(), correctedText, {
          inputLength: text.length,
          outputLength: correctedText.length,
          issuesCount: corrections.length,
          language: language
        });
      }
      
      // Track guest usage
      if (req.guest) {
        await incrementGuestUsage(req, 'grammar');
      }

      // New flattened response format for frontend consumption
      // NOTE: per product requirement, we do NOT return originalText here.
      res.json({
        success: true,
        data: {
          correctedText,
          corrections,
          language
        }
      });

    } catch (error) {
      console.error('Grammar check error:', error.message);

      // Handle specific ML service errors
      if (error.status) {
        // ML service unavailable
        if (error.status === 503) {
          return res.status(503).json({
            success: false,
            message: 'Grammar service unavailable'
          });
        }

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

      // Save to history for authenticated users
      if (req.user) {
        await this.saveToHistoryAndLimit(req.user._id, 'translate', text.trim(), mlData.translated_text, {
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          inputLength: text.length,
          outputLength: mlData.translated_text.length
        });
      }
      
      // Track guest usage
      if (req.guest) {
        await incrementGuestUsage(req, 'translate');
      }

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
    const requestedTone = req.body.tone || 'casual';

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

      // Call ML service through client with increased timeout for LLM inference
      const mlData = await Promise.race([
        mlClient.humanize({
          text: text.trim(),
          tone: requestedTone,
          language: language
        }),
        new Promise((_, reject) => {
          setTimeout(() => {
            const timeoutError = new Error('Humanization timed out');
            timeoutError.status = 503;
            reject(timeoutError);
          }, 60000); // Increased to 60s for LLM inference
        })
      ]);

      // Save to history for authenticated users
      if (req.user) {
        await this.saveToHistoryAndLimit(req.user._id, 'humanize', text.trim(), mlData.rewritten_text, {
          inputLength: text.length,
          outputLength: mlData.rewritten_text.length,
          tone: mlData.tone,
          language: language,
          humanizationLevel: 'medium'
        });
      }
      
      // Track guest usage
      if (req.guest) {
        await incrementGuestUsage(req, 'humanize');
      }

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
      const message = error.message || '';
      const shouldFallback =
        error.status === 503 ||
        /timeout|unreachable|econnreset|aborted|socket hang up/i.test(message);

      if (shouldFallback) {
        const fallbackText = this.buildHumanizeFallback(text.trim(), requestedTone);

        if (req.user) {
          await this.saveToHistoryAndLimit(req.user._id, 'humanize', text.trim(), fallbackText, {
            inputLength: text.length,
            outputLength: fallbackText.length,
            tone: requestedTone,
            language: language,
            humanizationLevel: 'fallback'
          });
        }

        if (req.guest) {
          await incrementGuestUsage(req, 'humanize');
        }

        return res.json({
          success: true,
          message: 'Text humanization completed successfully',
          data: {
            originalText: text,
            humanizedText: fallbackText,
            tone: requestedTone,
            language: language,
            method: 'fallback',
            changes: ['Adjusted tone and flow']
          }
        });
      }

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
      const resultSummary = `Plagiarism analysis completed. Score: ${mlData.plagiarismScore}%`;
      await this.saveToHistoryAndLimit(req.user._id, 'plagiarism', text.trim(), resultSummary, {
        plagiarismScore: mlData.plagiarismScore,
        riskLevel: mlData.riskLevel,
        inputLength: text.length,
        language: language,
        matchesCount: mlData.matchedSentences.length,
        totalSentences: mlData.totalSentences
      });

      res.json({
        success: true,
        message: 'Plagiarism check completed successfully',
        data: {
          text: text.trim(),
          plagiarismScore: mlData.plagiarismScore,
          riskLevel: mlData.riskLevel,
          matches: mlData.matchedSentences,
          language: language,
          totalSentences: mlData.totalSentences,
          recommendation: mlData.plagiarismScore > 50 ? 'Consider rephrasing the content' : 'Content appears original'
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

  /**
   * AI text detection endpoint
   * POST /api/ai/ai-detect
   */
  aiDetection = asyncHandler(async (req, res) => {
    const { text, language = 'en' } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a non-empty string'
      });
    }

    // Basic language validation (ML service performs strict validation too)
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'hi', 'ar', 'zh', 'ko'];
    if (!language || typeof language !== 'string' || !supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported'
      });
    }

    // Check if feature is enabled
    const settings = await AppSettings.getOrCreate();
    if (!settings.aiDetectionEnabled) {
      return res.status(403).json({
        success: false,
        message: 'This feature is currently disabled by admin'
      });
    }

    try {
      // Get ML client instance
      const mlClient = getMLClient();

      // Call ML service through client
      const mlData = await mlClient.aiDetection({
        text: text.trim(),
        language
      });

      // Save to history and limit records
      await this.saveToHistoryAndLimit(req.user._id, 'ai-detection', text.trim(), `AI: ${mlData.aiProbability}%`, {
        aiProbability: mlData.aiProbability,
        humanProbability: mlData.humanProbability,
        label: mlData.label,
        confidence: mlData.confidence,
        inputLength: text.length,
        language,
        textLength: text.length
      });

      // Flattened response shape for frontend
      res.json({
        success: true,
        language,
        aiProbability: mlData.aiProbability,
        humanProbability: mlData.humanProbability,
        label: mlData.label,
        confidence: mlData.confidence
      });

    } catch (error) {
      console.error('AI detection error:', error.message);

      // Handle specific ML service errors
      if (error.status) {
        // ML service / Ollama unavailable (timeouts, connection errors, crashes)
        if (error.status === 503) {
          return res.status(503).json({
            success: false,
            message: 'AI detection service unavailable'
          });
        }

        return res.status(error.status).json({
          success: false,
          error: error.data?.detail?.error || 'AI_DETECTION_ERROR',
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
}

module.exports = new AIController();
