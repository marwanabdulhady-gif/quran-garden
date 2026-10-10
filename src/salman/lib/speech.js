// نطق النص بصوت المتصفح. (التسجيلات بصوت المعلّق تُضاف في مرحلة الصوت — انظر الاقتراح §5.)
export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function speak(text, lang = 'ar') {
  if (!canSpeak()) return false;
  window.speechSynthesis.cancel();
  const u = new window.SpeechSynthesisUtterance(text);
  u.lang = lang === 'en' ? 'en-US' : 'ar-SA';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
  return true;
}
