# ListenPDF

Privacy-first PDF reader that speaks. Convert PDFs to speech directly in your browser. No data leaves your device.

## Features

- **Free TTS**: Uses browser's built-in voices (Web Speech API)
- **Premium AI Voices**: Optional high-quality OpenAI TTS integration (unlock via crypto donation)
- **Controls**: Play, pause, stop, speed adjustment, voice selection
- **Privacy**: 100% client-side processing. No server, no tracking.
- **Open Source**: MIT License

## Usage

1. Open `index.html` in a browser (or visit the GitHub Pages site)
2. Drag & drop a PDF
3. Choose a voice and speed
4. Click Play

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
- Speech Synthesis: Web Speech API
- Optional premium TTS: OpenAI `tts-1` model

## Disclaimer

This tool is provided as-is. Users are responsible for ensuring they have rights to the PDFs they process.
