// ListenPDF Text Normalizer
// Normalizes extracted PDF text for better TTS experience

class TextNormalizer {
  constructor() {
    // Common OCR errors mapping
    this.ocrCorrections = {
      // Common OCR misreads
      'rn': 'm',
      'cl': 'd',
      'vv': 'w',
      'ii': 'n',
      '1': 'l',
      '0': 'o',
      '5': 's',
      // Common word misreads
      'tlie': 'the',
      'whicli': 'which',
      'wliat': 'what',
      'tliis': 'this',
      'tlien': 'then',
      // Add more as needed
    };

    // Abbreviations to expand (optional, can be toggled)
    this.abbreviations = {
      'e.g.': 'for example',
      'i.e.': 'that is',
      'etc.': 'and so on',
      'vs.': 'versus',
      'Dr.': 'Doctor',
      'Mr.': 'Mister',
      'Mrs.': 'Misses',
      'Ms.': 'Miss',
      // Add more as needed
    };
  }

  /**
   * Basic cleanup - runs first, always
   */
  basicCleanup(text) {
    if (!text) return '';
    
    let cleaned = text;
    
    // 1. Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // 2. Fix line breaks in middle of sentences
    cleaned = cleaned.replace(/([a-z])-\s+([a-z])/gi, '$1$2'); // Join hyphenated words
    cleaned = cleaned.replace(/([a-z])\s*\n\s*([a-z])/gi, '$1 $2'); // Join words across line breaks
    
    // 3. Fix common punctuation issues
    cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1'); // Remove space before punctuation
    cleaned = cleaned.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2'); // Add space after punctuation
    
    // 4. Fix quotation marks
    cleaned = cleaned.replace(/``/g, '"');
    cleaned = cleaned.replace(/''/g, '"');
    
    // 5. Capitalize sentences
    cleaned = this.capitalizeSentences(cleaned);
    
    return cleaned.trim();
  }

  /**
   * Fix common OCR errors
   */
  fixOCR(text) {
    let fixed = text;
    
    // Apply OCR corrections
    for (const [error, correction] of Object.entries(this.ocrCorrections)) {
      const regex = new RegExp(`\\b${error}\\b`, 'gi');
      fixed = fixed.replace(regex, correction);
    }
    
    return fixed;
  }

  /**
   * Expand abbreviations (optional)
   */
  expandAbbreviations(text, expand = false) {
    if (!expand) return text;
    
    let expanded = text;
    
    for (const [abbr, full] of Object.entries(this.abbreviations)) {
      const regex = new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'gi');
      expanded = expanded.replace(regex, full);
    }
    
    return expanded;
  }

  /**
   * Capitalize first letter of sentences
   */
  capitalizeSentences(text) {
    return text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
      return prefix + letter.toUpperCase();
    });
  }

  /**
   * Format paragraphs - detect paragraph breaks
   */
  formatParagraphs(text) {
    // Look for double line breaks or indentation as paragraph markers
    const paragraphs = text.split(/\n\s*\n/);
    
    // Clean each paragraph
    const cleanedParagraphs = paragraphs.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      
      // Ensure paragraph starts with capital letter
      return this.capitalizeSentences(trimmed);
    }).filter(p => p.length > 0);
    
    // Join with double line breaks for TTS pause
    return cleanedParagraphs.join('\n\n');
  }

  /**
   * Main normalization function
   */
  normalize(text, options = {}) {
    const {
      fixOCR = true,
      expandAbbr = false,
      formatParagraphs = true
    } = options;
    
    let normalized = text;
    
    // Apply basic cleanup first
    normalized = this.basicCleanup(normalized);
    
    // Fix OCR errors if requested
    if (fixOCR) {
      normalized = this.fixOCR(normalized);
    }
    
    // Expand abbreviations if requested
    if (expandAbbr) {
      normalized = this.expandAbbreviations(normalized, true);
    }
    
    // Format paragraphs if requested
    if (formatParagraphs) {
      normalized = this.formatParagraphs(normalized);
    }
    
    return normalized;
  }

  /**
   * Advanced normalization using free LLM API
   * Uses Hugging Face Inference API (free tier) to rewrite text
   */
  async advancedNormalize(text, options = {}) {
    const {
      apiKey = '', // User can provide their own API key for higher limits
      model = 'microsoft/DialoGPT-small' // Small, free model
    } = options;
    
    try {
      // For longer texts, we need to chunk
      const chunks = this.chunkText(text, 500); // 500 chars per chunk
      const normalizedChunks = [];
      
      for (const chunk of chunks) {
        // Simple prompt for text normalization
        const prompt = `Please rewrite the following text to make it more natural for reading aloud. Fix any grammatical errors, improve flow, but keep the original meaning:\n\n"${chunk}"\n\nRewritten text:`;
        
        try {
          const response = await this.callLLMAPI(prompt, { apiKey, model });
          normalizedChunks.push(response);
        } catch (error) {
          console.warn('LLM API failed for chunk, using basic normalization:', error);
          normalizedChunks.push(this.normalize(chunk, { fixOCR: true }));
        }
      }
      
      return normalizedChunks.join(' ');
    } catch (error) {
      console.error('Advanced normalization failed:', error);
      // Fall back to basic normalization
      return this.normalize(text, { fixOCR: true });
    }
  }

  /**
   * Call free LLM API (Hugging Face Inference API)
   */
  async callLLMAPI(prompt, options = {}) {
    const { apiKey = '', model = 'microsoft/DialoGPT-small' } = options;
    
    // Without API key, we use the free unauthenticated endpoint (limited)
    const url = `https://api-inference.huggingface.co/models/${model}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const payload = {
      inputs: prompt,
      parameters: {
        max_length: 1000,
        temperature: 0.3,
        do_sample: true
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Try again later or use your own API key.');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      // Extract just the rewritten part (after "Rewritten text:")
      const fullResponse = data[0].generated_text;
      const rewrittenMatch = fullResponse.split('Rewritten text:')[1];
      return rewrittenMatch ? rewrittenMatch.trim() : fullResponse.trim();
    }
    
    // Fallback: return the raw response
    return JSON.stringify(data);
  }

  /**
   * Chunk text for processing
   */
  chunkText(text, maxChunkSize = 500) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      let end = start + maxChunkSize;
      
      // Try to break at sentence boundary
      if (end < text.length) {
        const sentenceEnd = text.lastIndexOf('.', end);
        const paragraphEnd = text.lastIndexOf('\n\n', end);
        
        if (paragraphEnd > start + maxChunkSize * 0.5) {
          end = paragraphEnd + 2; // Include the double newline
        } else if (sentenceEnd > start + maxChunkSize * 0.5) {
          end = sentenceEnd + 1; // Include the period
        }
      } else {
        end = text.length;
      }
      
      chunks.push(text.substring(start, end).trim());
      start = end;
    }
    
    return chunks.filter(chunk => chunk.length > 0);
  }
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextNormalizer;
} else {
  window.TextNormalizer = TextNormalizer;
}