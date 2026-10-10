import React, { useState } from 'react';

export const DEFAULT_NAME = 'صديقي';

export default function Welcome({ initialName = '', onStart }) {
  const [name, setName] = useState(initialName);
  const submit = (e) => {
    e.preventDefault();
    onStart(name.trim().slice(0, 20) || DEFAULT_NAME);
  };
  return (
    <main className="screen welcome" aria-labelledby="welcome-title">
      <div className="welcome-hero" aria-hidden="true">
        <span className="hero-letter">أ</span>
        <span className="hero-letter alt">ب</span>
        <span className="hero-letter alt2">ت</span>
        <span className="hero-animal">🦁</span>
        <span className="hero-animal alt">🦆</span>
        <span className="hero-animal alt2">🦊</span>
      </div>
      <h1 id="welcome-title" className="title">
        مغامرة الحروف
      </h1>
      <p className="tagline">كل حرف له صديق لطيف!</p>
      <p className="lead">اسحب الحرف إلى الحيوان الذي يبدأ به، واجمع النجوم في رحلة الحروف العربية.</p>
      <ul className="chips" aria-label="مميزات اللعبة">
        <li>٧ مستويات</li>
        <li>سحب وإفلات</li>
        <li>تفاعل صوتي</li>
      </ul>
      <form className="name-form" onSubmit={submit}>
        <label htmlFor="player-name">ما اسم البطل أو البطلة؟</label>
        <input
          id="player-name"
          type="text"
          value={name}
          maxLength={20}
          placeholder={DEFAULT_NAME}
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn primary big">
          هيا نلعب
        </button>
      </form>
      <p className="note">نحفظ الاسم ونتيجة اللعب على هذا الجهاز فقط — ليظهر التقدم للمعلم أو ولي الأمر.</p>
    </main>
  );
}
