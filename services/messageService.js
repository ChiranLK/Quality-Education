import { GoogleGenerativeAI } from "@google/generative-ai";
import { BadRequestError } from "../errors/customErrors.js";

// Lazy initialization of Google Gemini AI
let genAI = null;

/**
 * Get or initialize the Gemini AI instance
 * @returns {GoogleGenerativeAI|null}
 */
const getGeminiInstance = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Constants
const SINHALA_UNICODE_RANGE = /[\u0D80-\u0DFF]/;
const TAMIL_UNICODE_RANGE = /[\u0B80-\u0BFF]/;
const GEMINI_TIMEOUT_MS = 10000; // 10 seconds
const GEMINI_MODEL = "models/gemini-2.5-flash"; // Latest stable Gemini model
const MAX_RETRY_ATTEMPTS = 1; // Maximum number of retry attempts
const INITIAL_RETRY_DELAY_MS = 2000; // Initial delay: 2 seconds
const MAX_RETRY_DELAY_MS = 10000; // Max delay: 10 seconds


/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} - Delay in milliseconds
 */
const calculateBackoffDelay = (attempt) => {
  const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
};

/**
 * Check if error is a quota/rate limit error
 * @param {Error} error - Error to check
 * @returns {boolean} - True if error is quota-related
 */
const isQuotaError = (error) => {
  const errorStr = error.message || '';
  return (
    errorStr.includes('429') || 
    errorStr.includes('quota') ||
    errorStr.includes('Quota') ||
    errorStr.includes('Too Many Requests')
  );
};

const isRetryableError = (error) => {
  const errorStr = error.message || '';
  // DO NOT retry on 429 (quota exceeded) or 403 (forbidden) errors
  if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('403')) {
    return false;
  }
  return (
    errorStr.includes('503') || 
    errorStr.includes('Service Unavailable') ||
    errorStr.includes('timed out') ||
    errorStr.includes('ECONNRESET') ||
    errorStr.includes('ETIMEDOUT') ||
    errorStr.includes('temporarily')
  );
};

/**
 * Check if text contains Sinhala characters
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains Sinhala characters
 */
export const containsSinhalaCharacters = (text) => {
  if (!text || typeof text !== 'string') return false;
  return SINHALA_UNICODE_RANGE.test(text);
};

/**
 * Check if text contains Tamil characters
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains Tamil characters
 */
export const containsTamilCharacters = (text) => {
  if (!text || typeof text !== 'string') return false;
  return TAMIL_UNICODE_RANGE.test(text);
};

/**
 * Translate text to English using Google Gemini with retry logic
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language (Sinhala, Tamil, English, etc.)
 * @returns {Promise<string>} - Translated English text
 * @throws {Error} - If translation fails after all retries
 */
export const translateToEnglish = async (text, sourceLanguage = "Unknown") => {
  const geminiInstance = getGeminiInstance();
  
  if (!geminiInstance) {
    throw new Error("GEMINI_API_KEY is not configured. Cannot perform translation.");
  }

  let lastError;

  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Translation request timed out")), GEMINI_TIMEOUT_MS);
      });

      // Create translation promise
      const translationPromise = (async () => {
        const model = geminiInstance.getGenerativeModel({ model: GEMINI_MODEL });
        
        const prompt = `Translate the following ${sourceLanguage} text to English. Only provide the translation, nothing else:\n\n${text}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text().trim();
        
        if (!translatedText) {
          throw new Error("Translation returned empty response");
        }
        
        return translatedText;
      })();

      // Race between translation and timeout
      const translation = await Promise.race([translationPromise, timeoutPromise]);
      
      console.log(`✅ Translation successful on attempt ${attempt + 1}`);
      return translation;
      
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (isRetryableError(error) && attempt < MAX_RETRY_ATTEMPTS - 1) {
        const delayMs = calculateBackoffDelay(attempt);
        console.warn(
          `⚠️  Translation attempt ${attempt + 1} failed (${error.message}). ` +
          `Retrying in ${delayMs}ms... (Attempt ${attempt + 2}/${MAX_RETRY_ATTEMPTS})`
        );
        
        await sleep(delayMs);
        continue; // Try again
      }
      
      // Non-retryable error or last attempt failed
      if (isQuotaError(error)) {
        console.error(`❌ Translation quota exceeded - Free tier limit reached. Upgrade to paid plan or wait for quota reset.`);
        throw new Error("Translation quota exceeded. Please try again later or upgrade your Google API plan.");
      }
      
      console.error(`❌ Translation error (Attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}):`, error.message);
      
      if (attempt === MAX_RETRY_ATTEMPTS - 1) {
        // All retries exhausted
        if (error.message.includes("API key")) {
          throw new Error("Translation service configuration error.");
        } else if (error.message.includes("timed out")) {
          throw new Error("Translation service is temporarily unavailable. Please try again later.");
        } else {
          throw new Error(`Translation failed after ${MAX_RETRY_ATTEMPTS} attempts: ${error.message}`);
        }
      }
    }
  }

  // Fallback - should not reach here
  throw lastError || new Error("Translation failed: Unknown error");
};

/**
 * Translate Sinhala text to English using Google Gemini
 * @param {string} text - Sinhala text to translate
 * @returns {Promise<string>} - Translated English text
 * @throws {Error} - If translation fails
 */
export const translateSinhalaToEnglish = async (text) => {
  return translateToEnglish(text, "Sinhala");
};

/**
 * Translate Tamil text to English using Google Gemini
 * @param {string} text - Tamil text to translate
 * @returns {Promise<string>} - Translated English text
 * @throws {Error} - If translation fails
 */
export const translateTamilToEnglish = async (text) => {
  return translateToEnglish(text, "Tamil");
};

/**
 * Process message content and handle translation if needed
 * @param {string} messageText - Original message text
 * @returns {Promise<{message: string, requiresTranslation: boolean}>}
 * @deprecated Use processMessageFieldsByLanguage instead
 */
export const processMessageContent = async (messageText) => {
  if (!messageText || typeof messageText !== 'string') {
    throw new BadRequestError("Message text is required and must be a string");
  }

  const hasSinhala = containsSinhalaCharacters(messageText);
  
  let finalMessage = messageText;
  
  // Only translate if Sinhala characters are detected
  if (hasSinhala) {
    try {
      finalMessage = await translateSinhalaToEnglish(messageText);
      console.log("✅ Translation successful - storing translated message only");
    } catch (error) {
      console.error("❌ Translation failed, storing original message:", error.message);
      // Store original message if translation fails - don't block message creation
      finalMessage = messageText;
    }
  }
  
  return {
    message: finalMessage,
    requiresTranslation: hasSinhala
  };
};

/**
 * Process all message fields based on formUILanguage
 * @param {string} title - Title field
 * @param {string} message - Message field
 * @param {string} formUILanguage - Language selected in form (English, Sinhala, Tamil)
 * @returns {Promise<{title: string, message: string, requiresTranslation: boolean}>}
 */
export const processMessageFieldsByLanguage = async (title, message, formUILanguage) => {
  if (!title || typeof title !== 'string') {
    throw new BadRequestError("Title is required and must be a string");
  }
  if (!message || typeof message !== 'string') {
    throw new BadRequestError("Message is required and must be a string");
  }

  let finalTitle = title;
  let finalMessage = message;
  let requiresTranslation = false;

  // Only translate if not English
  if (formUILanguage && formUILanguage !== "English") {
    try {
      console.log(`🔄 Translating from ${formUILanguage} to English...`);
      
      // Translate both title and message
      const [translatedTitle, translatedMessage] = await Promise.all([
        translateToEnglish(title, formUILanguage),
        translateToEnglish(message, formUILanguage)
      ]);

      finalTitle = translatedTitle;
      finalMessage = translatedMessage;
      requiresTranslation = true;
      
      console.log("✅ Translation successful - storing translated fields");
    } catch (error) {
      console.error("❌ Translation failed, storing original fields:", error.message);
      // Store original fields if translation fails - don't block message creation
      finalTitle = title;
      finalMessage = message;
      requiresTranslation = true; // Mark that translation was attempted
    }
  }

  return {
    title: finalTitle,
    message: finalMessage,
    requiresTranslation
  };
};

/**
 * Create a new message with translation support based on formUILanguage
 * @param {Object} messageData - Message data including senderId and message
 * @param {Object} userData - User data from authentication
 * @param {string} formUILanguage - Language selected in form (English, Sinhala, Tamil)
 * @param {Object} fileData - Optional file upload data
 * @returns {Promise<Object>} - Created message object
 */
export const createMessageWithTranslation = async (messageData, userData, formUILanguage = "English", fileData = null) => {
  const { title, message } = messageData;
  
  if (!title || !message) {
    throw new BadRequestError("Title and message content are required");
  }

  // Process message fields based on selected form language
  const { title: processedTitle, message: processedMessage, requiresTranslation } = await processMessageFieldsByLanguage(
    title,
    message,
    formUILanguage
  );
  
  // Prepare the message object for database
  const messagePayload = {
    ...messageData,
    title: processedTitle,
    message: processedMessage,
    requiresTranslation,
    createdBy: userData.userId
  };

  // Add file path if image was uploaded
  if (fileData) {
    messagePayload.image = `uploads/${fileData.filename}`;
  }

  return messagePayload;
};
