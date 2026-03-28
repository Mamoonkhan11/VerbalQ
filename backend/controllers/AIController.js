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
    
    // Advanced humanization techniques to bypass AI detection
    if (tone === 'casual') {
      // Add contractions
      humanized = humanized
        .replace(/\bdo not\b/gi, "don't")
        .replace(/\bcannot\b/gi, "can't")
        .replace(/\bit is\b/gi, "it's")
        .replace(/\bi am\b/gi, "I'm")
        .replace(/\bwe are\b/gi, "we're")
        .replace(/\bthey are\b/gi, "they're")
        .replace(/\byou are\b/gi, "you're")
        .replace(/\bwill not\b/gi, "won't")
        .replace(/\bwould not\b/gi, "wouldn't")
        .replace(/\bcould not\b/gi, "couldn't")
        .replace(/\bshould not\b/gi, "shouldn't")
        .replace(/\bhas not\b/gi, "hasn't")
        .replace(/\bhaven not\b/gi, "haven't")
        .replace(/\bdid not\b/gi, "didn't")
        .replace(/\bis not\b/gi, "isn't")
        .replace(/\bare not\b/gi, "aren't")
        .replace(/\bwas not\b/gi, "wasn't")
        .replace(/\bwere not\b/gi, "weren't");
      
      // Add filler words and transitions
      humanized = humanized
        .replace(/\.\s+(In|The|This|That)/gi, ". Well, $1")
        .replace(/^(Actually|Basically|Generally|Typically)/i, "You know, $1")
        .replace(/\btherefore\b/gi, "so")
        .replace(/\bhowever\b/gi, "but then again")
        .replace(/\bmoreover\b/gi, "plus")
        .replace(/\bfurthermore\b/gi, "and another thing")
        .replace(/\bconsequently\b/gi, "as a result")
        .replace(/\bnevertheless\b/gi, "still")
        .replace(/\bnonetheless\b/gi, "even so");
      
      // Make sentences more conversational
      humanized = humanized
        .replace(/\bIt is important to note that\b/gi, "Here's the thing:")
        .replace(/\bIt should be noted that\b/gi, "Keep in mind that")
        .replace(/\bIn order to\b/gi, "To")
        .replace(/\bDue to the fact that\b/gi, "Because")
        .replace(/\bIn the event that\b/gi, "If")
        .replace(/\bAt this point in time\b/gi, "Right now")
        .replace(/\bFor the purpose of\b/gi, "For");
    }
    
    if (tone === 'professional') {
      humanized = humanized
        .replace(/\bwanna\b/gi, "want to")
        .replace(/\bgotta\b/gi, "have to")
        .replace(/\bkinda\b/gi, "somewhat")
        .replace(/\bsort of\b/gi, "rather");
    }
    
    if (tone === 'academic') {
      humanized = humanized
        .replace(/\bshow\b/gi, "demonstrate")
        .replace(/\btell\b/gi, "indicate")
        .replace(/\buse\b/gi, "utilize")
        .replace(/\bget\b/gi, "obtain");
    }
    
    if (tone === 'creative') {
      humanized = humanized
        .replace(/\.\s+/g, "! ")
        .replace(/\bvery\b/gi, "incredibly")
        .replace(/\bgood\b/gi, "exceptional")
        .replace(/\bbad\b/gi, "problematic")
        .replace(/\binteresting\b/gi, "fascinating");
    }

    // Capitalize first letter properly
    humanized = humanized.charAt(0).toUpperCase() + humanized.slice(1);
    
    // Ensure proper punctuation at end
    if (!/[.!?]$/.test(humanized)) {
      humanized += '.';
    }
    
    // Add slight variation in sentence structure (optional ellipsis for thoughtfulness)
    if (Math.random() > 0.7 && !humanized.includes('...')) {
      humanized = humanized.replace(/\.\s*$/, '...');
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
      
      // Log the ML service URL for debugging
      const mlUrl = process.env.ML_SERVICE_URL.replace(/\/$/, "");
      console.log(`📡 Forwarding grammar check request to: ${mlUrl}/grammar/check`);

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
      // Log the full error details for debugging
      console.error('ML Service Error:', error.response?.data || error.message);
      console.error('Error details:', {
        status: error.status,
        data: error.data,
        message: error.message,
        code: error.code
      });

      // Handle specific ML service errors
      if (error.status === 503) {
        console.warn('⚠️  ML Service is currently down or unreachable');
        return res.status(503).json({
          success: false,
          error: 'ML_SERVICE_UNAVAILABLE',
          message: 'ML Service is currently initializing, please try again in 30 seconds.'
        });
      }

      if (error.status) {
        const errorData = error.data?.detail || {};
        return res.status(error.status).json({
          success: false,
          error: errorData.error || 'TRANSLATION_ERROR',
          message: error.message
        });
      }

      // Network errors or other connection issues
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error('❌ Cannot connect to ML Service - Connection refused or not found');
        return res.status(503).json({
          success: false,
          error: 'ML_SERVICE_UNREACHABLE',
          message: 'ML Service is currently initializing, please try again in 30 seconds.'
        });
      }

      // Return generic error for other issues
      console.error('❌ Unexpected grammar check error:', error);
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
          }, 90000); // Increased to 90s for LLM inference
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
            humanizationLevel: 'fallback-advanced'
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
            changes: ['Applied advanced humanization patterns', 'Added natural contractions', 'Improved sentence flow', 'Enhanced conversational tone']
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
