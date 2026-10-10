// مقاطع المعلّق (الصوت الموحّد voice-00). كل مفتاح يطابق ملفًا في public/salman/audio/.
// النص محفوظ هنا ليُنطق بصوت المتصفح إذا تعذّر تحميل المقطع (انظر voice.js).
export const CLIPS = {
  welcome: { file: 'welcome.mp3', text: 'أهلًا يا سلمان! غابتك تنتظرك. هيا نزور حدائقها اليوم.' },
  correct: { file: 'correct.mp3', text: 'أحسنت! لقد أنبتّ نجمة جديدة في حديقتك.' },
  retry: { file: 'retry.mp3', text: 'قريب! جرّب مرة ثانية، أنت تقدر.' },
  hint: { file: 'hint.mp3', text: 'تلميح: الجواب الصحيح مضاء الآن. اختره بثقة.' },
  'visit-done': { file: 'visit-done.mp3', text: 'ممتاز! انتهت زيارة اليوم، وجاءتك هدية جديدة.' },
  'level-unlock': { file: 'level-unlock.mp3', text: 'فتحت مستوى جديدًا من السور! يا بطل.' },
  'surah-learned': { file: 'surah-learned.mp3', text: 'ما شاء الله! حفظت سورة جديدة. افتخر بنفسك.' },
  badge: { file: 'badge.mp3', text: 'وسام جديد! أنت بطل حقيقي.' },
  'garden-grow': { file: 'garden-grow.mp3', text: 'حديقتك تكبر! ظهرت شجرة جديدة.' },
  streak: { file: 'streak.mp3', text: 'أنت تزورنا كل يوم! استمر يا بطل.' },
};

export const CLIP_KEYS = Object.keys(CLIPS);
