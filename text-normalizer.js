// ListenPDF Text Normalizer
// Normalizes extracted PDF text for better TTS experience

class TextNormalizer {
  constructor() {
    // Initialize quality scorer
    this.qualityScorer = new TextQualityScorer();
    
    // Common OCR errors mapping
    this.ocrCorrections = {
      // Single character confusions
      '0': 'o',
      '1': 'l',
      '5': 's',
      '8': 'b',
      // Character pair confusions
      'rn': 'm',
      'cl': 'd',
      'vv': 'w',
      'ii': 'n',
      'cj': 'g',
      'ft': 't',
      'ff': 'f',
      'tt': 't',
      'nn': 'm',
      'ri': 'n',
      // Common word misreads
      'tlie': 'the',
      'whicli': 'which',
      'wliat': 'what',
      'tliis': 'this',
      'tlien': 'then',
      'tlieir': 'their',
      'tliree': 'three',
      'tlirough': 'through',
      'someliling': 'something',
      'evervlhing': 'everything',
      'notlring': 'nothing',
      'al': 'at',  // in "that" -> "th al"
      'lor': 'for',
      'lrom': 'from',
      'lound': 'found',
      'lo': 'to',
      'lhe': 'the',
      'ln': 'in',
      'lts': 'its',
      'lnter': 'inter',
      'lnternational': 'international',
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
   * Fix common OCR errors with context awareness
   */
  fixOCR(text) {
    let fixed = text;
    
    // First, fix character-level issues that are always wrong
    // (like 'rn' -> 'm' when it's a standalone word)
    for (const [error, correction] of Object.entries(this.ocrCorrections)) {
      // For short patterns (1-3 chars), they could be part of words
      if (error.length <= 3) {
        // Only replace if it's a whole word or common pattern
        const regex = new RegExp(`\\b${error}\\b`, 'gi');
        fixed = fixed.replace(regex, correction);
      }
    }
    
    // Fix common patterns that appear in the middle of words
    fixed = this.fixCommonPatterns(fixed);
    
    // Fix numbers that should be letters (context-aware)
    fixed = this.fixNumberLetterConfusions(fixed);
    
    return fixed;
  }

  /**
   * Fix patterns that commonly appear within words
   */
  fixCommonPatterns(text) {
    let fixed = text;
    
    // Patterns that are almost always wrong when they appear
    const patterns = {
      'tlie': 'the',
      'whicli': 'which', 
      'wliat': 'what',
      'tliis': 'this',
      'tlien': 'then',
      'tlieir': 'their',
      'tliree': 'three',
      'tlirough': 'through'
    };
    
    for (const [pattern, correction] of Object.entries(patterns)) {
      const regex = new RegExp(pattern, 'gi');
      fixed = fixed.replace(regex, correction);
    }
    
    return fixed;
  }

  /**
   * Context-aware number/letter confusion fixes
   * e.g., "1995" should stay "1995" but "l995" should be "1995"
   */
  fixNumberLetterConfusions(text) {
    let fixed = text;
    
    // Common patterns where 'l' should be '1' (in numbers)
    // Look for patterns like "l9" (should be "19") or "2l" (should be "21")
    const numberPatterns = [
      // Years: 19xx, 20xx
      /\b(l9\d{2})\b/gi,  // l995 -> 1995
      /\b(2l\d{2})\b/gi,  // 2l00 -> 2100
      // Decades: 1980s
      /\b(l9\d{0}s)\b/gi,
      // Page numbers: Page l, Chapter l
      /\b(Page\s+)l\b/gi,
      /\b(Chapter\s+)l\b/gi,
      /\b(Figure\s+)l\b/gi,
      /\b(Table\s+)l\b/gi
    ];
    
    numberPatterns.forEach(pattern => {
      fixed = fixed.replace(pattern, (match, p1) => {
        return p1.replace(/l/gi, '1');
      });
    });
    
    // Fix '0' vs 'O' confusion in common contexts
    // "Section 2.0" should stay, but "Secti0n" should be "Section"
    const letterPatterns = [
      /\b([A-Z][a-z]*)(0)([a-z]*)\b/gi,  // Word with 0 in middle
      /\b([a-z]+)(0)([A-Z][a-z]*)\b/gi   // Mixed case with 0
    ];
    
    letterPatterns.forEach(pattern => {
      fixed = fixed.replace(pattern, (match, p1, p2, p3) => {
        return p1 + 'o' + p3;
      });
    });
    
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
   * Remove PDF artifacts like page numbers, headers, footers
   */
  removePDFArtifacts(text) {
    let cleaned = text;
    
    // Remove common page number patterns
    cleaned = cleaned.replace(/\n\s*\d+\s*\n/g, '\n');  // Isolated page numbers
    cleaned = cleaned.replace(/\bPage\s+\d+\s+of\s+\d+\b/gi, '');
    cleaned = cleaned.replace(/\b-\s*\d+\s*-\b/g, '');   // Centered page numbers
    
    // Remove common header/footer patterns
    const headerFooterPatterns = [
      // Date patterns
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/gi,
      // Author names (common in headers)
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b(?=\s*\n)/g,
      // Conference/journal names in all caps
      /\b[A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})*\b(?=\s*\n)/g,
      // Short lines that are likely headers
      /^.{1,30}$\n/gm
    ];
    
    headerFooterPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Remove excessive whitespace created by removals
    cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    return cleaned.trim();
  }

  /**
   * Format paragraphs - detect paragraph breaks
   */
  formatParagraphs(text) {
    // First remove artifacts
    let cleaned = this.removePDFArtifacts(text);
    
    // Look for double line breaks or indentation as paragraph markers
    const paragraphs = cleaned.split(/\n\s*\n/);
    
    // Clean each paragraph
    const cleanedParagraphs = paragraphs.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      
      // Skip very short lines that might be leftover artifacts
      if (trimmed.length < 10 && /^\W*$/.test(trimmed)) return '';
      
      // Ensure paragraph starts with capital letter
      return this.capitalizeSentences(trimmed);
    }).filter(p => p.length > 0);
    
    // Join with double line breaks for TTS pause
    return cleanedParagraphs.join('\n\n');
  }

  /**
   * Smart normalization - adapts based on text quality
   */
  smartNormalize(text, options = {}) {
    const {
      fixOCR = true,
      expandAbbr = false,
      formatParagraphs = true,
      adaptive = true  // Use quality score to adjust normalization
    } = options;
    
    let normalized = text;
    
    // Analyze text quality if adaptive mode
    let qualityScore = 100;
    let needsOCRCorrection = fixOCR;
    
    if (adaptive && fixOCR) {
      const analysis = this.qualityScorer.analyze(text);
      qualityScore = analysis.score;
      
      // Adjust normalization based on quality
      needsOCRCorrection = analysis.needsNormalization;
      
      console.log(`Text quality score: ${qualityScore}/100, Needs OCR correction: ${needsOCRCorrection}`);
    }
    
    // Apply basic cleanup first (always)
    normalized = this.basicCleanup(normalized);
    
    // Fix OCR errors if needed
    if (needsOCRCorrection) {
      normalized = this.fixOCR(normalized);
      
      // Re-score after OCR correction
      if (adaptive) {
        const newScore = this.qualityScorer.score(normalized);
        console.log(`Quality after OCR correction: ${newScore}/100`);
      }
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
   * Main normalization function
   */
  normalize(text, options = {}) {
    const {
      fixOCR = true,
      expandAbbr = false,
      formatParagraphs = true,
      adaptive = false  // Default to non-adaptive for backward compatibility
    } = options;
    
    let normalized = text;
    
    // Analyze text quality if adaptive mode
    let qualityScore = 100;
    let needsOCRCorrection = fixOCR;
    
    if (adaptive && fixOCR) {
      const analysis = this.qualityScorer.analyze(text);
      qualityScore = analysis.score;
      
      // Adjust normalization based on quality
      needsOCRCorrection = analysis.needsNormalization;
      
      console.log(`Text quality score: ${qualityScore}/100, Needs OCR correction: ${needsOCRCorrection}`);
    }
    
    // Apply basic cleanup first (always)
    normalized = this.basicCleanup(normalized);
    
    // Fix OCR errors if needed
    if (needsOCRCorrection) {
      normalized = this.fixOCR(normalized);
      
      // Re-score after OCR correction
      if (adaptive) {
        const newScore = this.qualityScorer.score(normalized);
        console.log(`Quality after OCR correction: ${newScore}/100`);
      }
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