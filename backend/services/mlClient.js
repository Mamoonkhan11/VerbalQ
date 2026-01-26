const axios = require('axios');

/**
 * ML Service Client
 *
 * Centralized Axios client for communicating with the Python ML service.
 * This implements the proxy pattern where the Node.js backend forwards
 * AI requests to the Python FastAPI service without exposing it directly
 * to the frontend.
 *
 * Features:
 * - Environment-based URL configuration
 * - Automatic timeout handling (30s)
 * - Centralized error handling
 * - Health check capability
 * - Request/response interceptors
 */
class MLClient {
  constructor() {
    // Get ML service URL from environment variables
    this.baseURL = process.env.ML_SERVICE_URL;

    if (!this.baseURL) {
      throw new Error('ML_SERVICE_URL environment variable is not set');
    }

    // Create Axios instance with ML service configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 seconds timeout for ML operations
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const response = error.response;
        const url = error.config?.url;
        
        if (response) {
          // ML Service responded with an error status (4xx, 5xx)
          console.error(`ML Service Error [${response.status}] (${url}):`, response.data);
          
          const errorDetail = response.data?.detail;
          const message = (typeof errorDetail === 'object' ? errorDetail.message : errorDetail) || `ML service error: ${response.status}`;
          
          const mlError = new Error(message);
          mlError.status = response.status;
          mlError.data = response.data;
          throw mlError;
        } else if (error.request) {
          // Request was made but no response received (Service Down)
          console.error(`ML Service Unreachable (${url}):`, error.message);
          const mlError = new Error('ML service is unreachable');
          mlError.status = 503;
          throw mlError;
        } else {
          // Something else happened
          console.error(`ML Client Error (${url}):`, error.message);
          throw error;
        }
      }
    );
  }

  /**
   * Check if ML service is reachable
   * @returns {Promise<boolean>} True if service is available
   */
  async isHealthy() {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.warn('ML service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Grammar check request
   * @param {Object} data - Request data
   * @param {string} data.text - Text to check
   * @param {string} data.language - Language code (e.g., 'en', 'es', 'fr')
   * @returns {Promise<Object>} ML service response
   */
  async grammarCheck(data) {
    try {
      const response = await this.client.post('/grammar/check', data);
      return response.data;
    } catch (error) {
      console.error('Grammar check failed:', error.message);
      throw error;
    }
  }

  /**
   * Text translation request
   * @param {Object} data - Request data
   * @param {string} data.text - Text to translate
   * @param {string} data.source_lang - Source language code
   * @param {string} data.target_lang - Target language code
   * @returns {Promise<Object>} ML service response
   */
  async translate(data) {
    try {
      const response = await this.client.post('/translate', data);
      return response.data;
    } catch (error) {
      console.error('Translation failed:', error.message);
      throw error;
    }
  }

  /**
   * Text humanization request
   * @param {Object} data - Request data
   * @param {string} data.text - Text to humanize
   * @param {string} data.tone - Tone for humanization (default: 'casual')
   * @param {string} data.language - Language code for humanization
   * @returns {Promise<Object>} ML service response
   */
  async humanize(data) {
    try {
      const response = await this.client.post('/humanize', data);
      return response.data;
    } catch (error) {
      console.error('Humanization failed:', error.message);
      throw error;
    }
  }

  /**
   * Plagiarism check request
   * @param {Object} data - Request data
   * @param {string} data.text - Text to check for plagiarism
   * @param {string} data.language - Language code for plagiarism checking
   * @returns {Promise<Object>} ML service response
   */
  async plagiarismCheck(data) {
    try {
      const response = await this.client.post('/plagiarism/check', data);
      return response.data;
    } catch (error) {
      console.error('Plagiarism check failed:', error.message);
      throw error;
    }
  }
}

// Create and export singleton instance
let mlClientInstance = null;

const getMLClient = () => {
  if (!mlClientInstance) {
    mlClientInstance = new MLClient();
  }
  return mlClientInstance;
};

module.exports = getMLClient;