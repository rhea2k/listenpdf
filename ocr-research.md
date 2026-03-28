# OCR Error Research for ListenPDF

## Common OCR Error Patterns

Based on research into Tesseract, Adobe Acrobat, and other OCR engines:

### 1. Character Confusions (Single Character)
- '0' (zero) ↔ 'O' (capital letter O)
- '1' (one) ↔ 'l' (lowercase L) ↔ 'I' (capital i)
- '5' ↔ 'S'
- '8' ↔ 'B'
- 'rn' ↔ 'm'
- 'cl' ↔ 'd'
- 'vv' ↔ 'w'
- 'ii' ↔ 'n'
- 'cj' ↔ 'g'
- 'ft' ↔ 't'
- 'ff' ↔ 'f'
- 'tt' ↔ 't'

### 2. Word-Level Common Errors
- 'tlie' ↔ 'the'
- 'whicli' ↔ 'which'
- 'wliat' ↔ 'what'
- 'tliis' ↔ 'this'
- 'tlien' ↔ 'then'
- 'tliree' ↔ 'three'
- 'tlirough' ↔ 'through'
- 'tlieir' ↔ 'their'
- 'someliling' ↔ 'something'
- 'evervlhing' ↔ 'everything'
- 'al' ↔ 'at' (common in "that" → "th al")

### 3. Punctuation Issues
- '..' ↔ '.'
- ',.' ↔ ','
- '".' ↔ '."'
- Hyphens at line breaks not rejoined
- Smart quotes ('""') ↔ straight quotes ('"')

### 4. Formatting Artifacts
- Page numbers in headers/footers
- Running headers repeated
- Footnotes appearing inline
- Column text not properly sequenced

### 5. Font/Size Issues
- Small text misread (superscript, footnotes)
- Bold text recognized as separate characters
- Italics causing character distortion

## Context-Aware Corrections Needed

Some corrections depend on context:
- "I 0wn this" vs "I own this" (number vs letter)
- "In 1995" (correct) vs "In l995" (OCR error)
- "Chapter 1" vs "Chapter l"

## PDF Extraction Specific Issues
- Text extraction order wrong (columns, text boxes)
- Images with embedded text not extracted
- Form fields not recognized
- Tables converted to garbled text

## Test PDFs to Collect
1. Scanned academic paper (worst case)
2. Modern text-based PDF (best case)
3. Magazine with columns
4. Legal document with footnotes
5. Book with chapters and page numbers

## Implementation Strategy

### Phase 1: Rule-based (Current)
- Character-level replacements
- Word-level dictionaries
- Basic punctuation fixes

### Phase 2: Statistical
- N-gram analysis for context
- Language model probabilities
- Common phrase patterns

### Phase 3: ML-based
- Train model on OCR error patterns
- Context-aware corrections
- Learn from user feedback