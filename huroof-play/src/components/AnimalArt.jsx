import React, { useState } from 'react';

// رسمة الحيوان المولّدة، ولو مش موجودة أو فشلت في التحميل بتظهر الإيموجي (نفس الاسم، نفس الموقع).
export default function AnimalArt({ pair }) {
  const [failed, setFailed] = useState(false);
  if (!pair.image || failed) {
    return (
      <span className="emoji" aria-hidden="true">
        {pair.emoji}
      </span>
    );
  }
  return (
    <img
      className="art"
      src={`${import.meta.env.BASE_URL}${pair.image}`}
      alt=""
      width="96"
      height="96"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
