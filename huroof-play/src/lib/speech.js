// نطق عربي بالمتصفح (Web Speech API — speechSynthesis). لو مش متاح بيرجع false بهدوء.
// الاستخدام: speak('أسد') — الواجهة دايمًا بتعرض النص، فالصوت إضافة مش شرط.

export function canSpeak() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

export function speak(text, { lang = 'ar', rate = 0.9 } = {}) {
  if (!canSpeak() || !text) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}
