# Source transcriptions — Arabic learning journey

Markdown transcriptions of the two Drive PDFs for the Arabic learning journey in Salman's Garden. They are **source material for parents and educators**. The app does not use them, and neither file is reviewed as final text.

Both PDFs are image-only scans with no text layer, so every word here came from either a visual reading of the page or OCR.

| File | Source | Pages | Method | Status |
|---|---|---|---|---|
| `alphabet-with-the-companions.md` | Drive `12y4bMBEvS0bOrVMjZA8r9TezHNmc9TSX` — «حروف الهجاء مع الصحابة» | 56 scanned | Visual transcription, page by page, from the images | Full structure: 27 letter chapters plus the closing section. **Needs a full proofread against the printed book.** Flagged passages are marked `[مراجعة]`. Spot-checked against page 4 (printed p. 11, ch. ب): text and citations match. The page-order anomaly around pp. 48–50 (ه cover before ن story) needs checking on the printed copy. |
| `alphabet-with-the-final-prophet.md` | Drive `1LOYecCL_acpZQEZNWDY0k5IuzUsnVjvN` («Welcome file.md»، نص Markdown جاهز، 28 حرفًا) — وهو نفس كتاب «حروف الهجاء مع خاتم الأنبياء» (Drive `1QipxkfLJXg_1R4Gwq4nvwSKP8Kqt7DwK`، PDF ممسوح، 50 صفحة) | 50 scanned | نص جاهز من Drive، وقورن بالتعرف الضوئي على صفحات الـ PDF: تطابق في معظم الصفحات. الصفحات p05 و p29 و p49 صور أو أغلفة بلا نص. | 28 حرفًا كاملة. **لم يُراجَع بعد مقابل الكتاب المطبوع.** |

## Conventions
- Chapter heading: `## الفصل N — الحرف: X — «كلمة»` (companions). Then the story, parent questions (أسئلة تربوية وأفكار عملية), and source footnotes (`⁽¹⁾`).
- Final-prophet file: one `## الصفحة N` section per scan page. Each page is story, hadith, or idea, as printed. OCR confidence sits in an HTML comment.
- Hadith and Qur'an citations are kept as printed. They have not been checked against external sources.
- Harakat are as shown in the scan. OCR drops many of them.

## Generated outputs
- `src/salman/data/stories.generated.js` ← `python3 tools/build_salman_stories.py --write` (reads both Markdown files here).
- `journey/index.html` ← `python3 tools/build_journey.py`.

## OCR fallback (superseded)
`tools/ocr-superseded/` holds the OCR pipeline used before the Drive text was found (tesseract.js with the Arabic model, 300 dpi page renders). It is kept only for reference. Its output for the final-prophet book was replaced by the Drive text. OCR on the companions book was too garbled to use.

## How to finish verification
1. Proofread `alphabet-with-the-companions.md` against the printed book, chapter by chapter, and clear every `[مراجعة]` marker.
2. Proofread `alphabet-with-the-final-prophet.md` against the scan. Start with the ⚠️ pages, then the rest.
3. Only then use these texts to write app stories (see `docs/salmans-garden/PROPOSAL.md`).

## Do not
- Do not place the source PDFs or page images in this repo. They live outside it, in `/home/user/.qa-tools/pdf-src/`.
