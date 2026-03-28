// Text Quality Scorer for ListenPDF
// Estimates how "normal" text is for determining if normalization is needed

class TextQualityScorer {
  constructor() {
    // Common English words (top 1000)
    this.commonWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
      'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
      'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
      'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
      'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
      'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
      'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
    ]);
    
    // Common OCR error patterns to detect
    this.ocrErrorPatterns = [
      /tlie/gi,
      /whicli/gi,
      /wliat/gi,
      /tliis/gi,
      /tlien/gi,
      /\b[0-9][a-z]+\b/gi,  // mixed numbers and letters
      /\b[a-z]+[0-9]+\b/gi   // letters then numbers
    ];
    
    // Uncommon character patterns
    this.uncommonPatterns = [
      /[0-9]{4,}/g,  // long number sequences
      /[A-Z]{4,}/g,  // all caps words
      /[^a-zA-Z0-9\s.,!?'"-]/g  // unusual characters
    ];
  }
  
  /**
   * Score text quality (0-100, higher is better)
   */
  score(text) {
    if (!text || text.length < 10) return 100;
    
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 100;
    
    // 1. Common word ratio
    const commonWordCount = words.filter(w => this.commonWords.has(w.replace(/[^a-z]/g, ''))).length;
    const commonWordRatio = commonWordCount / words.length;
    
    // 2. OCR error detection
    let ocrErrorScore = 0;
    this.ocrErrorPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        ocrErrorScore += matches.length;
      }
    });
    
    // 3. Uncommon pattern detection
    let uncommonScore = 0;
    this.uncommonPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        uncommonScore += matches.length;
      }
    });
    
    // 4. Sentence structure (rough estimate)
    const sentenceCount = (text.match(/[.!?]+/g) || []).length;
    const avgWordsPerSentence = sentenceCount > 0 ? words.length / sentenceCount : 10;
    const sentenceStructureScore = Math.min(1, avgWordsPerSentence / 5); // 5-25 words per sentence is normal
    
    // Calculate final score
    let score = 0;
    
    // Common words weight: 40%
    score += commonWordRatio * 40;
    
    // OCR errors weight: -30% (penalty)
    const ocrPenalty = Math.min(30, ocrErrorScore * 5);
    score -= ocrPenalty;
    
    // Uncommon patterns weight: -20% (penalty)
    const uncommonPenalty = Math.min(20, uncommonScore * 3);
    score -= uncommonPenalty;
    
    // Sentence structure weight: 10%
    score += sentenceStructureScore * 10;
    
    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));
    
    return Math.round(score);
  }
  
  /**
   * Get detailed breakdown of score
   */
  analyze(text) {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const commonWords = words.filter(w => this.commonWords.has(w.replace(/[^a-z]/g, '')));
    
    const ocrErrors = [];
    this.ocrErrorPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        ocrErrors.push(...matches);
      }
    });
    
    const uncommonPatterns = [];
    this.uncommonPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        uncommonPatterns.push(...matches);
      }
    });
    
    return {
      score: this.score(text),
      wordCount: words.length,
      commonWordCount: commonWords.length,
      commonWordRatio: words.length > 0 ? commonWords.length / words.length : 0,
      ocrErrors: [...new Set(ocrErrors)], // unique errors
      uncommonPatterns: [...new Set(uncommonPatterns)], // unique patterns
      needsNormalization: this.score(text) < 70
    };
  }
  
  /**
   * Quick check if text needs normalization
   */
  needsNormalization(text, threshold = 70) {
    return this.score(text) < threshold;
  }
}

// Export for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextQualityScorer;
} else {
  window.TextQualityScorer = TextQualityScorer;
}