import React, { useState } from 'react';

// Source logos vary wildly (SVG wordmarks, cropped photos, low-res thumbnails,
// even a raw base64 blob) with no shared aspect ratio or background color.
// This normalizes all of them into one consistent mark: a plain logo sits on
// a white plate so it reads cleanly regardless of its own background, and a
// gradient + initials badge covers universities with no usable image at all.

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-teal-400 to-blue-600',
  'from-violet-500 to-blue-600',
  'from-sky-400 to-indigo-500',
  'from-indigo-500 to-slate-700',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-violet-600',
];

const STOPWORDS = new Set(['university', 'the', 'of', 'and', 'institute', 'college', 'academy', 'school']);

const getInitials = (name = '') => {
  const clean = name.replace(/\(.*?\)/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const significant = words.filter(w => w.length > 1 && !STOPWORDS.has(w.toLowerCase()));
  const source = significant.length ? significant : words;
  if (source.length === 1 && source[0].length <= 6) return source[0].toUpperCase();
  return source.slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
};

const getGradient = (name = '') => {
  const hash = name.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
};

const UniversityMark = ({ name, imageUrl, className = '', wrapperPadding = 'p-3 sm:p-4', platePadding = 'p-4' }) => {
  const [errored, setErrored] = useState(false);
  const showImage = imageUrl && !errored;
  const gradient = getGradient(name);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -right-4 w-28 h-28 rounded-full bg-black/10 blur-2xl" />

      {showImage ? (
        <div className={`absolute inset-0 flex items-center justify-center ${wrapperPadding}`}>
          <div className={`bg-white rounded-lg shadow-lg w-full h-full flex items-center justify-center ${platePadding}`}>
            <img
              src={imageUrl}
              alt={name}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              loading="lazy"
              onError={() => setErrored(true)}
            />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-white/95 drop-shadow-sm select-none"
            style={{ fontSize: 'clamp(1.25rem, 12%, 2.5rem)' }}>
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  );
};

export default UniversityMark;
