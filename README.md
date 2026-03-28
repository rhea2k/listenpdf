# ListenPDF

Privacy-first PDF reader that speaks. Convert PDFs to speech directly in your browser. No data leaves your device.

## Features

- **Free TTS**: Uses browser's built-in voices (Web Speech API)
- **Text Normalization**: Fixes OCR errors and improves text flow for better audio experience
- **Premium AI Voices**: Optional high-quality OpenAI TTS integration (unlock via crypto donation)
- **Controls**: Play, pause, stop, speed adjustment, voice selection
- **Privacy**: 100% client-side processing. No server, no tracking.
- **Open Source**: MIT License

## Usage

1. Open `index.html` in a browser (or visit the GitHub Pages site)
2. Drag & drop a PDF
3. Text is automatically normalized for better audio quality
4. Choose a voice and speed
5. Click Play

## Text Normalization

ListenPDF includes advanced text normalization to improve the audio experience:

### Basic Normalization (Always On)
- Fixes common OCR errors (e.g., "rn" → "m", "cl" → "d")
- Removes excessive whitespace and fixes line breaks
- Corrects punctuation and capitalization
- Joins hyphenated words across line breaks

### Advanced Normalization (Optional)
When enabled, uses AI to:
- Rewrite text for better flow and readability
- Fix grammatical errors while preserving meaning
- Improve overall audio experience

The normalization happens entirely in your browser - no text is sent to external servers.

## Premium Features

- Premium AI voice (OpenAI TTS)
- MP3 download of entire document
- Sentence highlighting sync
- Batch processing

Unlock with a crypto donation. See modal for addresses.

## Self-Hosting

This is a static site. You can host it anywhere:

- GitHub Pages (free)
- Netlify / Vercel (free tiers)
- Any static web server

Just upload the three files: `index.html`, `style.css`, `app.js`.

## Technical

- PDF parsing: [PDF.js](https://mozilla.github.io/pdf.js/)
- Text normalization: Custom rule-based system with optional LLM enhancement
- Speech Synthesis: Web Speech API
- Optional premium TTS: OpenAI `tts-1` model

## Disclaimer

This tool is provided as-is. Users are responsible for ensuring they have rights to the PDFs they process.
