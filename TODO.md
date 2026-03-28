# ListenPDF - Text Normalization Roadmap

## Completed (Mar 28)
- ✓ Basic text normalizer with OCR correction
- ✓ Advanced normalization using free LLM APIs
- ✓ UI integration with toggle controls
- ✓ Test page for normalization
- ✓ Deployment to GitHub
- ✓ Updated documentation

## In Progress / Next Steps

### 1. Enhanced OCR Correction
- [ ] Expand OCR error dictionary (research common patterns)
- [ ] Add context-aware corrections (phrase-level)
- [ ] Include PDF extraction artifacts (page numbers, headers, footers)
- [ ] Test with real OCR'd PDFs

### 2. Local Processing Options
- [ ] Research browser-based LLMs (TensorFlow.js, ONNX.js)
- [ ] Test tiny models (DistilBERT, TinyLLaMA)
- [ ] Implement WebAssembly inference pipeline
- [ ] Create offline-first mode

### 3. Audio Quality Testing
- [ ] Create test suite with sample PDFs
- [ ] Generate before/after audio samples
- [ ] Develop objective quality metrics
- [ ] User testing feedback loop

### 4. User Experience
- [ ] Add progress indicators for processing
- [ ] Create side-by-side text comparison
- [ ] Add presets (Academic, Casual, Professional)
- [ ] Implement batch processing for long documents

### 5. Monetization Features
- [ ] Premium normalization tiers
- [ ] Crypto payment integration
- [ ] API key management for advanced users
- [ ] Usage analytics (opt-in)

### 6. Performance Optimization
- [ ] Chunk processing for large PDFs
- [ ] Caching normalized text
- [ ] Background processing with Web Workers
- [ ] Memory management for long documents

### 7. Documentation
- [ ] Demo videos
- [ ] Case studies
- [ ] API documentation for developers
- [ ] Troubleshooting guide

## Immediate Tasks (Tonight)
1. Expand OCR correction patterns based on research
2. Create test suite with real OCR'd PDF samples
3. Research local LLM options for browser
4. Add progress indicators for long processing

## Success Metrics
- Audio quality improvement (subjective/user ratings)
- Processing speed (seconds per page)
- User retention/return rate
- Premium feature adoption rate