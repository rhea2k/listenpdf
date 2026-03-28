# ListenPDF

Privacy-first PDF reader that speaks. Convert PDFs to speech directly in your browser. No data leaves your device.

## 🎯 The Problem

Scanned PDFs and OCR'd documents often have:
- OCR errors (e.g., "tlie" instead of "the")
- Poor formatting (line breaks in middle of sentences)
- Page numbers, headers, footers mixed with content
- Inconsistent spacing and punctuation

This makes for a terrible listening experience. ListenPDF fixes all of this.

## ✨ Features

### 🆓 **Free & Private**
- **100% client-side** - No text leaves your browser
- **No accounts** - No tracking, no data collection
- **Open source** - MIT License, fully transparent

### 🔊 **High-Quality Audio**
- **Browser TTS** - Uses your browser's built-in voices
- **Text Normalization** - Fixes OCR errors, improves flow
- **Adaptive Processing** - Smartly adjusts based on text quality
- **Speed Control** - Adjust playback speed (0.5x - 2x)

### 🛠️ **Advanced Text Processing**
- **OCR Error Correction** - Fixes hundreds of common OCR mistakes
- **Context-Aware** - Understands when "l" should be "1" (e.g., "1995" not "l995")
- **PDF Artifact Removal** - Removes page numbers, headers, footers
- **Formatting Cleanup** - Fixes line breaks, spacing, punctuation
- **Optional LLM Enhancement** - Uses AI for even better results

### 💎 **Premium Features** (Crypto Unlock)
- **Premium AI Voices** - High-quality OpenAI TTS
- **MP3 Download** - Save audio for offline listening
- **Batch Processing** - Convert multiple PDFs
- **Priority Support** - Get help when you need it

## 🚀 Quick Start

1. **Open** `index.html` in any modern browser
2. **Drag & drop** a PDF file
3. **Listen** - Text is automatically normalized and read aloud

Or use the hosted version: [https://rhea2k.github.io/listenpdf/](https://rhea2k.github.io/listenpdf/)

## 📖 Text Normalization Explained

ListenPDF transforms messy OCR'd text into natural-sounding audio:

### **Level 1: Basic Cleanup** (Always On)
```
"tlie quick brown fox jumped" → "The quick brown fox jumped"
"whicli   was  quite   impressive" → "which was quite impressive"
"Page 3 of 15" → (removed)
```

### **Level 2: OCR Correction** (Smart)
```
"l995" → "1995" (but "to" stays "to", not "t0")
"Secti0n" → "Section" (but "2.0" stays "2.0")
"rn" → "m" (when it's wrong, not in "brain")
```

### **Level 3: LLM Enhancement** (Optional)
Uses AI to rewrite text for better flow while preserving meaning:
```
"AI systems, they are revolutionizing industries" → 
"AI systems are revolutionizing industries"
```

### **Level 4: Audio Optimization**
- Adds natural pauses between paragraphs
- Adjusts sentence rhythm for listening
- Optimizes for TTS pronunciation

## 🎮 Demo

Try the interactive demo: `demo.html`

See before/after examples and test different normalization levels.

## 🔧 Technical Details

### **Core Technologies**
- **PDF Parsing**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **Text Processing**: Custom JavaScript normalizer
- **Speech Synthesis**: Web Speech API
- **Optional AI**: Hugging Face Inference API (free tier)

### **Architecture**
```
PDF File → PDF.js → Raw Text → Text Normalizer → Clean Text → TTS → Audio
                      ↑                                    ↑
               Quality Analysis                    Optional LLM
```

### **Privacy Guarantee**
- ✅ No text sent to servers (unless you enable LLM)
- ✅ No analytics or tracking
- ✅ Everything runs in your browser
- ✅ Open source code for verification

## 💰 Premium Features

Support development and unlock:
- **High-quality AI voices** (OpenAI TTS)
- **MP3 downloads** for offline listening
- **Batch processing** of multiple files
- **Advanced normalization** options

**Unlock with crypto**: Bitcoin or Ethereum donations.

## 🚀 Deployment

### **Self-Hosting**
```bash
# Clone the repository
git clone https://github.com/rhea2k/listenpdf.git
cd listenpdf

# Serve locally
python3 -m http.server 8000
# Then open http://localhost:8000
```

### **GitHub Pages**
1. Fork the repository
2. Enable GitHub Pages in Settings
3. Your site will be at: `https://username.github.io/listenpdf/`

### **Netlify/Vercel**
Drag and drop the folder to deploy.

## 📊 Performance

- **Text Processing**: < 1 second per page
- **Memory Usage**: Minimal (all client-side)
- **Browser Support**: Chrome, Firefox, Safari, Edge
- **File Size**: < 100KB (excluding PDF.js)

## 🧪 Testing

### **Test Files Included**
- `test-normalizer.html` - Test text normalization
- `test-normalizer-v2.html` - Enhanced OCR testing
- `demo.html` - Full interactive demo

### **Test with Your PDFs**
1. Try a scanned academic paper
2. Try a modern text-based PDF
3. Compare the audio quality

## 🤝 Contributing

We welcome contributions! Areas that need help:

1. **OCR Patterns** - Add more correction rules
2. **Language Support** - Non-English PDFs
3. **UI Improvements** - Better user experience
4. **Performance** - Faster processing

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## ⚠️ Disclaimer

This tool is provided as-is. Users are responsible for:
- Ensuring they have rights to the PDFs they process
- Complying with copyright laws
- Backing up their data

---

**Made with ❤️ for the open source community**

*Turning unreadable PDFs into enjoyable audiobooks, one document at a time.*