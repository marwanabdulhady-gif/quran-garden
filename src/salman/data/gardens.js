// الحدائق الأربع لحديقة سلمان (docs/salmans-garden/PROPOSAL.md §2).
// قصص العربية تُبنى من الكتابين (stories.generated.js). قصص القرآن في quran.js.
// هنا: قصص الرياضيات والإنجليزية (قصيرة، أصلية) وتعريف الحدائق.

export const GARDENS = {
  quran: { id: 'quran', name: 'حديقة القرآن', guide: 'سلمان', color: '#14b8a6', emoji: '🌴' },
  arabic: { id: 'arabic', name: 'حديقة الحروف', guide: 'الهدهد', color: '#fb7185', emoji: '🌸' },
  english: { id: 'english', name: 'حديقة الإنجليزية', guide: 'دودة الحرير', color: '#eab308', emoji: '🌻' },
  math: { id: 'math', name: 'حديقة الأرقام', guide: 'السنجاب', color: '#22c55e', emoji: '🍎' },
};

export const GARDEN_ORDER = ['arabic', 'math', 'quran', 'english'];

// قصص الأرقام: كل قصة تعدّ حتى رقم، ويُسأل الطفل عن العدد. النص عربي والأرقام عربية.
export const MATH_STORIES = [
  {
    id: 'math-01',
    title: 'السنجاب يعد الجوز',
    count: 3,
    text: 'جمع السنجاب جوزات تحت الشجرة: واحدة، اثنتان، ثلاث. كم جوزة جمع السنجاب؟',
  },
  {
    id: 'math-02',
    title: 'النجوم في السماء',
    count: 5,
    text: 'في الليل ظهرت نجوم كثيرة. عدّ معنا: واحدة، اثنتان، ثلاث، أربع، خمس. كم نجمة رأينا؟',
  },
  {
    id: 'math-03',
    title: 'التفاحات الحمراء',
    count: 7,
    text: 'على الشجرة تفاحات حمراء. نعدّها معًا حتى سبعة. كم تفاحة على الشجرة؟',
  },
  {
    id: 'math-04',
    title: 'الأصدقاء في الحديقة',
    count: 10,
    text: 'وصل الأصدقاء إلى الحديقة واحدًا بعد الآخر حتى عشرة. كم صديقًا وصل إلى الحديقة؟',
  },
];

// قصص الإنجليزية (الفونيكس): كل قصة تُدرّب صوتًا واحدًا، ويُسأل الطفل عن الصوت الذي يسمعه.
export const ENGLISH_STORIES = [
  {
    id: 'en-01',
    title: 'Sam and the Sun',
    sound: 's',
    text: 'Sam sat in the sun. A snake went sss. Sss is the sound of s. Listen: sss, sss, sun.',
    choices: ['s', 'a'],
  },
  {
    id: 'en-02',
    title: 'The Ant',
    sound: 'a',
    text: 'An ant is small. The ant says a, a, a. a is the sound in ant and apple.',
    choices: ['a', 'i'],
  },
  {
    id: 'en-03',
    title: 'Tim and the Top',
    sound: 't',
    text: 'Tim spins a top. It goes t, t, t. Tap, tap, t is the sound of t.',
    choices: ['t', 'p'],
  },
  {
    id: 'en-04',
    title: 'Pip the Pig',
    sound: 'p',
    text: 'Pip the pig says p, p, p. Pop, pop, p is the sound of p.',
    choices: ['p', 'n'],
  },
  {
    id: 'en-05',
    title: 'In the Bin',
    sound: 'i',
    text: 'The pin is in the bin. It goes i, i, i. Little i is in pin and bin.',
    choices: ['i', 'o'],
  },
  {
    id: 'en-06',
    title: 'Nan and the Nest',
    sound: 'n',
    text: 'Nan puts a nut in the nest. It goes nnn, nnn. n is the sound of nut and nest.',
    choices: ['n', 'm'],
  },
];
