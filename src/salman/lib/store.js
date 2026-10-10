// تخزين حالة حديقة سلمان في localStorage بمفتاح مستقل (لا يلمس تخزين حديقة القرآن).
import { STORAGE_KEY, createState, normalizeState } from './gamify.js';

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage ? storage.getItem(STORAGE_KEY) : null;
    return raw ? normalizeState(JSON.parse(raw)) : createState();
  } catch {
    return createState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
