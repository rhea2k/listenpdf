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
let pageTexts = []; // Array to store text for each page
let currentPage = 1; // Current page being read
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
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
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
  
  // Page navigation
  prevPageBtn.addEventListener('click', goToPreviousPage);
  nextPageBtn.addEventListener('click', goToNextPage);

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

    // Extract text from each page separately
    pageTexts = [];
    fullText = '';
    currentPage = 1; // Reset to first page
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const rawPageText = textContent.items.map(item => item.str).join(' ');
      pageTexts.push(rawPageText);
      fullText += rawPageText + '\n';
    }
    
    // Normalize each page separately
    const normalizer = new TextNormalizer();
    const qualityScorer = new TextQualityScorer();
    
    // Show loading state
    textContent.textContent = `Processing ${pdfDoc.numPages} pages...`;
    
    // Normalize each page
    const normalizedPageTexts = [];
    let totalQualityBefore = 0;
    let totalQualityAfter = 0;
    
    for (let i = 0; i < pageTexts.length; i++) {
      const pageNum = i + 1;
      const rawPageText = pageTexts[i];
      
      // Update loading status
      if (pageTexts.length > 1) {
        textContent.textContent = `Processing page ${pageNum} of ${pageTexts.length}...`;
      }
      
      // Analyze page quality
      const pageQuality = qualityScorer.analyze(rawPageText);
      totalQualityBefore += pageQuality.score;
      
      // Normalize this page
      let normalizedPageText;
      if (advancedNormalizationCheckbox.checked) {
        // Use LLM for advanced normalization
        try {
          normalizedPageText = await normalizer.advancedNormalize(rawPageText, {
            fixOCR: true,
            expandAbbr: false
          });
        } catch (error) {
          console.warn(`LLM failed for page ${pageNum}, using basic normalization:`, error);
          normalizedPageText = normalizer.normalize(rawPageText, {
            fixOCR: true,
            expandAbbr: false,
            formatParagraphs: true
          });
        }
      } else {
        // Use basic normalization
        normalizedPageText = normalizer.normalize(rawPageText, {
          fixOCR: true,
          expandAbbr: false,
          formatParagraphs: true,
          adaptive: true
        });
      }
      
      // Analyze normalized quality
      const normalizedQuality = qualityScorer.score(normalizedPageText);
      totalQualityAfter += normalizedQuality;
      
      normalizedPageTexts.push(normalizedPageText);
    }
    
    // Update pageTexts with normalized versions
    pageTexts = normalizedPageTexts;
    
    // Combine all normalized pages for display
    fullText = pageTexts.join('\n\n');
    words = fullText.split(/\s+/).filter(w => w.length > 0);
    
    // Calculate average quality scores
    const avgQualityBefore = Math.round(totalQualityBefore / pageTexts.length);
    const avgQualityAfter = Math.round(totalQualityAfter / pageTexts.length);
    const avgImprovement = avgQualityAfter - avgQualityBefore;
    
    // Show first page and quality info
    updatePageDisplay();
    textContent.textContent = `${pageTexts[0]}\n\n---\nPage 1 of ${pageTexts.length} | Text Quality: ${avgQualityBefore}/100 → ${avgQualityAfter}/100 (${avgImprovement > 0 ? '+' : ''}${avgImprovement})`;

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
  
  // Make sure we have page text
  if (!pageTexts || pageTexts.length === 0) {
    alert('No text available to play. Please upload a PDF first.');
    return;
  }

  // Get text from current page only
  const textToSpeak = pageTexts[currentPage - 1];
  
  if (!textToSpeak || textToSpeak.trim().length === 0) {
    alert('This page has no text to read.');
    return;
  }

  currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
  const selectedVoiceIndex = voiceSelect.value;
  if (voices[selectedVoiceIndex]) currentUtterance.voice = voices[selectedVoiceIndex];
  currentUtterance.rate = parseFloat(speedRange.value);
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;

  // Word-by-word progress tracking
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
    // Auto-advance to next page when finished
    if (currentPage < pageTexts.length) {
      setTimeout(() => {
        currentPage++;
        updatePageDisplay();
        // Auto-play next page
        setTimeout(() => startPlaying(), 500);
      }, 1000); // 1 second pause between pages
    }
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

// Page navigation functions
function updatePageDisplay() {
  if (!pageTexts || pageTexts.length === 0) return;
  
  // Update current page display
  currentPageSpan.textContent = `Page ${currentPage}`;
  totalPagesSpan.textContent = ` of ${pageTexts.length}`;
  
  // Update navigation buttons
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= pageTexts.length;
  
  // Show current page text
  const pageText = pageTexts[currentPage - 1];
  
  // Show page text with page indicator
  const qualityScorer = new TextQualityScorer();
  const pageQuality = qualityScorer.score(pageText);
  let qualityIndicator = '';
  
  if (pageQuality < 60) {
    qualityIndicator = ` (Quality: ${pageQuality}/100 - may need manual review)`;
  }
  
  textContent.textContent = `${pageText}\n\n---\nPage ${currentPage} of ${pageTexts.length}${qualityIndicator}`;
  
  // Update words for progress tracking
  words = pageText.split(/\s+/).filter(w => w.length > 0);
  
  // Reset progress
  progressBar.value = 0;
  progressText.textContent = '0%';
  
  // Stop any current playback
  if (isPlaying) {
    stopPlaying();
  }
}

function goToNextPage() {
  if (currentPage < pageTexts.length) {
    currentPage++;
    updatePageDisplay();
  }
}

function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    updatePageDisplay();
  }
}

// Placeholder for OpenAI TTS download
async function generateMP3WithOpenAI() {
  // Premium feature coming soon
  alert('MP3 download with premium AI voice is coming soon. For now, enjoy free listening!');
}

downloadBtn.addEventListener('click', generateMP3WithOpenAI);

// Initialize
init();
