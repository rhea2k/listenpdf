// ListenPDF - Privacy-First PDF to Speech
// Everything runs in the browser. No data is sent to any server.

// Config (update as needed)
const CONFIG = {
  cryptoAddresses: {
    btc: '1YourBitcoinAddressHere',
    eth: '0xYourEthereumAddressHere'
  },
  premiumUnlocked: false   // Will be set after manual unlock verification
};

// PDF.js setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// State
let pdfDoc = null;
let fullText = '';
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let voices = [];
let isPlaying = false;
let currentWordIndex = 0;
let words = [];

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('pdf-upload');
const uploadSection = document.getElementById('upload-section');
const playerSection = document.getElementById('player-section');
const pdfTitle = document.getElementById('pdf-title');
const pageCount = document.getElementById('page-count');
const textContent = document.getElementById('text-content');
const voiceSelect = document.getElementById('voice-select');
const speedRange = document.getElementById('speed-range');
const speedValue = document.getElementById('speed-value');
const advancedNormalizationCheckbox = document.getElementById('advanced-normalization');
const premiumVoiceCheckbox = document.getElementById('premium-voice');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const downloadSection = document.getElementById('download-section');
const downloadBtn = document.getElementById('download-btn');
const unlockPremiumBtn = document.getElementById('unlock-premium');
const unlockDownloadBtn = document.getElementById('unlock-download');
const modal = document.getElementById('premium-modal');
const closeModal = document.querySelector('.close');
const donateLink = document.getElementById('donate-link');

// Initialization
function init() {
  // Load voices
  function loadVoices() {
    voices = speechSynthesis.getVoices();
    populateVoiceList();
  }
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Speed display
  speedRange.addEventListener('input', () => {
    speedValue.textContent = speedRange.value + 'x';
  });

  // File upload handlers
  dropArea.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('dragover', e => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--primary)';
  });
  dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = 'var(--border)';
  });
  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--border)';
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', e => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  // Playback
  playBtn.addEventListener('click', () => {
    if (!isPlaying) startPlaying();
  });
  pauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      speechSynthesis.pause();
      isPlaying = false;
      pauseBtn.disabled = true;
      playBtn.disabled = false;
    }
  });
  stopBtn.addEventListener('click', stopPlaying);

  // Premium unlock modal
  unlockPremiumBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  unlockDownloadBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  // Manual unlock
  document.getElementById('manual-unlock').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('manual-unlock-form').classList.toggle('hidden');
  });
  document.getElementById('verify-unlock').addEventListener('click', verifyUnlock);

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const code = this.parentElement.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const orig = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = orig, 1500);
      });
    });
  });

  // Donate
  donateLink.addEventListener('click', e => {
    e.preventDefault();
    modal.classList.remove('hidden');
  });

  // Premium voice toggle
  premiumVoiceCheckbox.addEventListener('change', () => {
    if (premiumVoiceCheckbox.checked && !CONFIG.premiumUnlocked) {
      premiumVoiceCheckbox.checked = false;
      modal.classList.remove('hidden');
    }
  });
}

// PDF Handling
async function handleFile(file) {
  if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file.');
    return;
  }

  const arrayBuffer = await file.arrayBuffer();
  try {
    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    pdfTitle.textContent = file.name.replace('.pdf', '');
    pageCount.textContent = `Pages: ${pdfDoc.numPages}`;

    // Extract text from all pages
    fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Apply text normalization for better TTS
    const rawText = fullText;
    const normalizer = new TextNormalizer();
    
    // Show loading state
    textContent.textContent = 'Processing text for better audio quality...';
    
    try {
      if (advancedNormalizationCheckbox.checked) {
        // Use advanced normalization with LLM
        fullText = await normalizer.advancedNormalize(rawText, {
          fixOCR: true,
          expandAbbr: false
        });
      } else {
        // Use basic normalization
        fullText = normalizer.normalize(rawText, {
          fixOCR: true,
          expandAbbr: false,
          formatParagraphs: true
        });
      }
      
      // Split into words for progress tracking
      words = fullText.split(/\s+/).filter(w => w.length > 0);
      textContent.textContent = fullText;
      
    } catch (error) {
      console.error('Text normalization failed:', error);
      // Fall back to basic normalization
      fullText = normalizer.normalize(rawText, {
        fixOCR: true,
        expandAbbr: false,
        formatParagraphs: true
      });
      words = fullText.split(/\s+/).filter(w => w.length > 0);
      textContent.textContent = fullText;
    }

    uploadSection.classList.add('hidden');
    playerSection.classList.remove('hidden');
    downloadSection.classList.add('hidden');

    // Auto-select first voice
    if (voices.length) voiceSelect.selectedIndex = 0;

  } catch (err) {
    console.error(err);
    alert('Failed to read PDF. The file may be protected or corrupted.');
  }
}

function populateVoiceList() {
  voiceSelect.innerHTML = '';
  voices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — default' : ''}`;
    voiceSelect.appendChild(option);
  });
}

// TTS Playback
function startPlaying() {
  if (isPlaying) return;

  // For now, always use Web Speech API.
  // Premium voice (OpenAI) will be implemented later as an optional download/MP3 feature.

  const textToSpeak = fullText;

  currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
  const selectedVoiceIndex = voiceSelect.value;
  if (voices[selectedVoiceIndex]) currentUtterance.voice = voices[selectedVoiceIndex];
  currentUtterance.rate = parseFloat(speedRange.value);
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;

  // Word-by-word progress tracking is tricky with Web Speech API.
  // We'll use onboundary event for word boundaries.
  let wordIndex = 0;
  currentUtterance.onboundary = (event) => {
    if (event.name === 'word') {
      wordIndex++;
      const percent = Math.min(100, Math.round((wordIndex / words.length) * 100));
      progressBar.value = percent;
      progressText.textContent = percent + '%';
    }
  };

  currentUtterance.onend = () => {
    stopPlaying();
  };

  speechSynthesis.speak(currentUtterance);
  isPlaying = true;
  playBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
}

function stopPlaying() {
  speechSynthesis.cancel();
  isPlaying = false;
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  progressBar.value = 0;
  progressText.textContent = '0%';
}

// Premium unlock verification (simulated)
function verifyUnlock() {
  const txHash = document.getElementById('tx-hash').value.trim();
  if (!txHash) {
    alert('Please enter a transaction hash.');
    return;
  }
  // In a real implementation, we'd verify on-chain or via webhook.
  // For now, just thank the user and note manual verification within 24h.
  alert('Thank you for your support! We will verify your transaction and enable premium features within 24 hours. For now, you can continue using the free version.');
  document.getElementById('manual-unlock-form').classList.add('hidden');
  modal.classList.add('hidden');
}

// Placeholder for OpenAI TTS download
async function generateMP3WithOpenAI() {
  // Premium feature coming soon
  alert('MP3 download with premium AI voice is coming soon. For now, enjoy free listening!');
}

downloadBtn.addEventListener('click', generateMP3WithOpenAI);

// Initialize
init();
