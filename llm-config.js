// LLM Configuration for Text Normalization
// Multiple free/cheap LLM API options

const LLM_CONFIG = {
  // Hugging Face Inference API (Free tier, limited)
  huggingFace: {
    name: 'Hugging Face Inference API',
    url: 'https://api-inference.huggingface.co/models/',
    models: {
      small: 'microsoft/DialoGPT-small',  // Fast, free
      medium: 'gpt2',                      // GPT-2, free
      quality: 'google/flan-t5-base'       // Better quality
    },
    requiresKey: false,  // Works without key but rate limited
    rateLimit: '~10 requests/hour without key'
  },
  
  // OpenRouter (Free tier with limited credits)
  openRouter: {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      free: 'openrouter/auto',  // Auto-selects free model
      cheap: 'huggingfaceh4/zephyr-7b-beta:free'  // Free model
    },
    requiresKey: true,  // Free tier requires API key
    rateLimit: '100 free requests/day'
  },
  
  // Cohere (Free tier)
  cohere: {
    name: 'Cohere',
    url: 'https://api.cohere.ai/v1/generate',
    models: {
      free: 'command'  // Free tier available
    },
    requiresKey: true,
    rateLimit: 'Free tier available'
  },
  
  // Local alternative (if user has Ollama running)
  local: {
    name: 'Local Ollama',
    url: 'http://localhost:11434/api/generate',
    models: {
      small: 'llama2:7b',
      tiny: 'tinyllama'
    },
    requiresKey: false,
    rateLimit: 'None (local)'
  }
};

// Prompt templates for text normalization
const PROMPT_TEMPLATES = {
  basic: `Please rewrite the following text to make it more natural for reading aloud. Fix any grammatical errors, improve flow, but keep the original meaning:\n\n"{{text}}"\n\nRewritten text:`,
  
  academic: `Please rewrite this academic text for better oral presentation. Maintain technical accuracy but improve sentence flow for listening:\n\n"{{text}}"\n\nRewritten text:`,
  
  ocr: `This text was extracted from a scanned document and may have OCR errors. Please correct any errors and rewrite for smooth reading:\n\n"{{text}}"\n\nCorrected text:`,
  
  concise: `Rewrite this text to be more concise and easier to listen to. Remove redundancy but keep the core message:\n\n"{{text}}"\n\nRewritten text:`
};

// Export for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LLM_CONFIG, PROMPT_TEMPLATES };
} else {
  window.LLM_CONFIG = LLM_CONFIG;
  window.PROMPT_TEMPLATES = PROMPT_TEMPLATES;
}