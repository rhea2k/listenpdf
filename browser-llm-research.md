# Browser-Based LLM Options for ListenPDF

## Requirements
- Run entirely in browser (no server calls)
- Small model size (<100MB ideally)
- Reasonable performance on CPU
- Good text normalization capabilities
- Open source license

## Options Evaluated

### 1. TensorFlow.js Models
**DistilBERT** (Transformers.js)
- Size: ~67MB (quantized)
- Capabilities: Text classification, NER, could be adapted for correction
- Performance: Good on modern browsers
- Libraries: Transformers.js, TensorFlow.js

**TinyBERT**
- Size: ~15MB
- Capabilities: Similar to BERT but smaller
- Performance: Very fast

**GPT-2 Small** (TensorFlow.js)
- Size: ~124MB
- Capabilities: Text generation
- Performance: Slower but more capable

### 2. ONNX Runtime Web
**Phi-2** (Microsoft)
- Size: ~1.3GB (too large)
- Capabilities: Excellent but too big

**TinyLlama**
- Size: ~550MB (still large)
- Capabilities: Good but size problematic

**Custom trained model**
- Could train small model specifically for text normalization
- Size: <50MB possible
- Would need training data (OCR error patterns)

### 3. Specialized Correction Models
**spaCy** (via WebAssembly)
- Size: ~10-20MB for English model
- Capabilities: NER, POS tagging, dependency parsing
- Could use for grammar checking

**LanguageTool** (WebAssembly)
- Size: ~20MB
- Capabilities: Grammar and style checking
- Open source

### 4. Rule-Based + Small Neural
**Hybrid Approach**
- Rule-based for common errors (current approach)
- Small neural model for context-aware corrections
- Ensemble for best results

## Implementation Strategy

### Phase 1: Current (Rule-based + API)
- ✓ Rule-based OCR correction
- ✓ Free LLM API fallback
- Works but requires internet for best results

### Phase 2: Add Browser ML (Target: 2-4 weeks)
1. **Integrate Transformers.js**
   - Load DistilBERT for sentence scoring
   - Use to rank correction candidates
   - Size: ~67MB (acceptable with lazy loading)

2. **Add spaCy for grammar**
   - WebAssembly version
   - Grammar and punctuation fixes
   - Size: ~15MB

3. **Custom small model**
   - Train on OCR error dataset
   - Focus on common patterns
   - Target size: <10MB

### Phase 3: Full Offline (Target: 2-3 months)
1. **Complete offline pipeline**
2. **Model compression** (quantization, pruning)
3. **Progressive enhancement** (load models in background)

## Technical Considerations

### Model Loading
- Use IndexedDB for caching
- Lazy load models only when needed
- Show loading progress to user

### Performance
- Web Workers for background processing
- Chunk processing for long texts
- Throttle UI updates

### Fallback Strategy
1. Try local model first
2. If fails/too slow, use rule-based
3. If user has internet, offer API option

## Dataset for Training

Need OCR error dataset:
- Common OCR errors (Tesseract, Adobe, etc.)
- Paired incorrect/correct text
- Can generate synthetically:
  - Take clean text
  - Apply common error patterns
  - Create training pairs

## Next Steps

### Immediate (Week 1)
1. Test Transformers.js integration
2. Benchmark performance
3. Evaluate model accuracy

### Short-term (Week 2-3)
1. Build synthetic training dataset
2. Train small custom model
3. Integrate with ListenPDF

### Medium-term (Month 2)
1. Add spaCy for grammar
2. Optimize loading
3. User testing

## Success Metrics
- Offline correction accuracy vs API
- Processing time per page
- User satisfaction with offline mode
- Model load time