# huroof-play — deploy shim

The letter game now lives inside the main site (`src/huroof/`, opened from the Arabic garden).

This folder only exists because the Vercel project **huroof-play** is connected to this repo with
Root Directory = `huroof-play`. `vercel.json` here makes that project build the **whole site** from the
repo root (`npm run build`) and serve `dist/` — the four gardens on `/`, the Quran journey on `/quran.html`.

If the Vercel project's Root Directory is changed to the repo root, this folder can be deleted.
