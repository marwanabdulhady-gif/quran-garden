# Source transcriptions — Arabic learning journey

Markdown transcriptions of the two Drive PDFs for the Arabic learning journey in Salman's Garden. They are **source material for parents and educators**. The app does not use them, and neither file is reviewed as final text.

Both PDFs are image-only scans with no text layer, so every word here came from either a visual reading of the page or OCR.

| File | Source | Pages | Method | Status |
|---|---|---|---|---|
| `alphabet-with-the-companions.md` | Drive `12y4bMBEvS0bOrVMjZA8r9TezHNmc9TSX` — «حروف الهجاء مع الصحابة» | 56 scanned | Visual transcription, page by page, from the images | Full structure: 27 letter chapters plus the closing section. **Needs a full proofread against the printed book.** Flagged passages are marked `[مراجعة]`. Spot-checked against page 4 (printed p. 11, ch. ب): text and citations match. The page-order anomaly around pp. 48–50 (ه cover before ن story) needs checking on the printed copy. |
| `alphabet-with-the-final-prophet.md` | Drive `1QipxkfLJXg_1R4Gwq4nvwSKP8Kqt7DwK` — «حروف الهجاء مع خاتم الأنبياء» | 50 scanned | Tesseract OCR (Arabic model, 300 dpi), then automatic cleanup | **All 50 pages included, one heading per page.** Not proofread. Pages with OCR confidence below 70% are marked ⚠️. Page 1 is the cover, with no OCR text. The earlier partial version (ended mid-sentence at about p. 38) is in git history, commit `df878fa`. |

## Conventions
- Chapter heading: `## الفصل N — الحرف: X — «كلمة»` (companions). Then the story, parent questions (أسئلة تربوية وأفكار عملية), and source footnotes (`⁽¹⁾`).
- Final-prophet file: one `## الصفحة N` section per scan page. Each page is story, hadith, or idea, as printed. OCR confidence sits in an HTML comment.
- Hadith and Qur'an citations are kept as printed. They have not been checked against external sources.
- Harakat are as shown in the scan. OCR drops many of them.

## Reproducing the final-prophet conversion
Tools live in `tools/` and are not run by CI.
1. Render pages from the PDF at 300 dpi (pypdfium2) into `/home/user/.qa-tools/pages/prophet/pNN.png`.
2. `node tools/ocr_pages.mjs` (tesseract.js 5 with `@tesseract.js-data/ara` 1.0.0; writes `/home/user/.qa-tools/ocr/out/prophet/pNN.txt`). The script also handles the companions PDF, but its output was too garbled to use.
3. Save per-page confidence as JSON at `/home/user/.qa-tools/ocr/conf-prophet.json`.
4. `python3 tools/build_prophet_md.py` writes the Markdown.

Paths are hard-coded to the sandbox layout. Adjust them if you move the work.

## How to finish verification
1. Proofread `alphabet-with-the-companions.md` against the printed book, chapter by chapter, and clear every `[مراجعة]` marker.
2. Proofread `alphabet-with-the-final-prophet.md` against the scan. Start with the ⚠️ pages, then the rest.
3. Only then use these texts to write app stories (see `docs/salmans-garden/PROPOSAL.md`).

## Do not
- Do not place the source PDFs or page images in this repo. They live outside it, in `/home/user/.qa-tools/pdf-src/`.
