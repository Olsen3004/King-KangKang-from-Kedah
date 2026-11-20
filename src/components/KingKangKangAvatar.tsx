import React from 'react';

interface KingKangKangAvatarProps {
  className?: string;
  label?: string;
}

export function KingKangKangAvatar({
  className = 'h-full w-full',
  label,
}: KingKangKangAvatarProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Cheerful primary-school sky-blue backdrop */}
      <rect width="120" height="120" fill="#60A5FA" />
      <circle cx="60" cy="60" r="54" fill="#7DD3FC" />

      {/* Soft cartoon clouds */}
      <g fill="#FFFFFF" fillOpacity="0.8">
        <ellipse cx="22" cy="24" rx="10" ry="5" />
        <ellipse cx="98" cy="24" rx="10" ry="5" />
      </g>

      {/* Flying string (Tali Teraju tail line) */}
      <path
        d="M 60 85 Q 58 102 54 118"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />

      {/* Authentic Busur (Humming Bow): straight/gently tensioned bamboo rod + taut daun ibus ribbon */}
      <g>
        {/* Taut cream daun ibus humming ribbon + upper guy-line to kepala */}
        <path
          d="M 13 38 L 60 32 L 107 38"
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line
          x1="13"
          y1="38"
          x2="107"
          y2="38"
          stroke="#FFFBEB"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Bamboo busur rod flexing gently under tension */}
        <path
          d="M 12 38 Q 60 43 108 38"
          fill="none"
          stroke="#78350F"
          strokeWidth="4.6"
          strokeLinecap="round"
        />
        <path
          d="M 12 38 Q 60 43 108 38"
          fill="none"
          stroke="#D97706"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Bamboo node notches & waxed lashing tips */}
        <circle cx="12" cy="38" r="2.5" fill="#DC2626" stroke="#1C1917" strokeWidth="1.3" />
        <circle cx="108" cy="38" r="2.5" fill="#DC2626" stroke="#1C1917" strokeWidth="1.3" />
      </g>

      {/* Wau Kangkang Body (broad upper wings + narrow waist + splayed twin legs) */}
      <path
        d="M 52 29
           Q 60 27 68 29
           L 68.5 46
           C 86 48, 106 55, 108 65
           C 106 76, 84 80, 68 79
           C 72 89, 83 99, 92 109
           C 79 103, 68 94, 60 86
           C 52 94, 41 103, 28 109
           C 37 99, 48 89, 52 79
           C 36 80, 14 76, 12 65
           C 14 55, 34 48, 51.5 46
           Z"
        fill="#EF4444"
        stroke="#1C1917"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Inner golden border trim piping along the wings & body */}
      <path
        d="M 67.5 49
           C 84 51, 101 57, 103 65
           C 101 73, 82 76.5, 65.5 76
           C 68.5 85, 76 93, 84 101
           C 74 96, 66 89, 60 82
           C 54 89, 46 96, 36 101
           C 44 93, 51.5 85, 54.5 76
           C 38 76.5, 19 73, 17 65
           C 19 57, 36 51, 52.5 49"
        fill="none"
        stroke="#FDE047"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Tulang Belakang (Bamboo spine) & Pinggang (waist lashing detail) */}
      <line
        x1="60"
        y1="30"
        x2="60"
        y2="85"
        stroke="#B91C1C"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect
        x="55"
        y="78.5"
        width="10"
        height="3.2"
        rx="1.5"
        fill="#FACC15"
        stroke="#1C1917"
        strokeWidth="1.2"
      />

      {/* Traditional Sobek Floral Rosettes on Left & Right Wings */}
      <g>
        {/* Left wing sobek flower + green leaves */}
        <ellipse cx="22.5" cy="59.5" rx="3.2" ry="1.8" transform="rotate(-25 22.5 59.5)" fill="#10B981" />
        <ellipse cx="22.5" cy="70.5" rx="3.2" ry="1.8" transform="rotate(25 22.5 70.5)" fill="#10B981" />
        <circle cx="28" cy="65" r="7.5" fill="#0D9488" stroke="#FACC15" strokeWidth="1.8" />
        <circle cx="28" cy="65" r="4.2" fill="#FDE047" />
        <circle cx="28" cy="65" r="2" fill="#EF4444" />

        {/* Right wing sobek flower + green leaves */}
        <ellipse cx="97.5" cy="59.5" rx="3.2" ry="1.8" transform="rotate(25 97.5 59.5)" fill="#10B981" />
        <ellipse cx="97.5" cy="70.5" rx="3.2" ry="1.8" transform="rotate(-25 97.5 70.5)" fill="#10B981" />
        <circle cx="92" cy="65" r="7.5" fill="#0D9488" stroke="#FACC15" strokeWidth="1.8" />
        <circle cx="92" cy="65" r="4.2" fill="#FDE047" />
        <circle cx="92" cy="65" r="2" fill="#EF4444" />
      </g>

      {/* Sobek diamond & leaf motifs on splayed Kaki Kangkang legs */}
      <g>
        <polygon points="46,90 48.5,87.5 51,90 48.5,92.5" fill="#FDE047" />
        <polygon points="74,90 71.5,87.5 69,90 71.5,92.5" fill="#FDE047" />
        <circle cx="42.5" cy="95.5" r="2" fill="#10B981" stroke="#FDE047" strokeWidth="0.9" />
        <circle cx="77.5" cy="95.5" r="2" fill="#10B981" stroke="#FDE047" strokeWidth="0.9" />
        {/* Golden ankle bands & fluttering leg tip tassels */}
        <path d="M 35 101 L 29.5 107 M 85 101 L 90.5 107" stroke="#FACC15" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M 28 109 Q 24 113 21 112 M 92 109 Q 96 113 99 112" fill="none" stroke="#FDE047" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Subtle wing-tip tassels */}
      <path d="M 12 65 Q 7 69 9 73 M 108 65 Q 113 69 111 73" fill="none" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round" />

      {/* Tall Cartoon Oval Eyes extending OUTSIDE the upper edge of the Wau */}
      <g>
        <ellipse
          cx="48.5"
          cy="51"
          rx="8.4"
          ry="11.8"
          fill="#FFFFFF"
          stroke="#1C1917"
          strokeWidth="2.5"
        />
        <ellipse
          cx="71.5"
          cy="51"
          rx="8.4"
          ry="11.8"
          fill="#FFFFFF"
          stroke="#1C1917"
          strokeWidth="2.5"
        />
        <ellipse cx="49.5" cy="52.5" rx="4.2" ry="5.4" fill="#1C1917" />
        <ellipse cx="70.5" cy="52.5" rx="4.2" ry="5.4" fill="#1C1917" />
        <circle cx="51.1" cy="50" r="1.7" fill="#FFFFFF" />
        <circle cx="72.1" cy="50" r="1.7" fill="#FFFFFF" />
      </g>

      {/* Cheerful cartoon smile directly on the Wau body */}
      <g>
        <path
          d="M 49 66.5 Q 60 70 71 66.5 Q 68.5 77 60 77 Q 51.5 77 49 66.5 Z"
          fill="#7F1D1D"
          stroke="#1C1917"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M 50.8 67.3 Q 60 70.2 69.2 67.3 L 68.3 70.6 Q 60 72.3 51.7 70.6 Z"
          fill="#FFFFFF"
        />
        <ellipse cx="60" cy="74.6" rx="4.4" ry="2" fill="#FB7185" />
      </g>

      {/* Golden Royal Crown fitted snugly onto the Wau's top head */}
      <g>
        <path
          d="M 49.5 29.5
             L 47 15.5
             L 54.5 21.5
             L 60 10.5
             L 65.5 21.5
             L 73 15.5
             L 70.5 29.5
             Q 60 31.5 49.5 29.5
             Z"
          fill="#FACC15"
          stroke="#1C1917"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M 49 26.8 Q 60 29 71 26.8 L 70.7 30.8 Q 60 33 49.3 30.8 Z"
          fill="#F59E0B"
          stroke="#1C1917"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="47" cy="14.5" r="2" fill="#FEF08A" stroke="#1C1917" strokeWidth="1.4" />
        <circle cx="60" cy="9.5" r="2.3" fill="#FEF08A" stroke="#1C1917" strokeWidth="1.4" />
        <circle cx="73" cy="14.5" r="2" fill="#FEF08A" stroke="#1C1917" strokeWidth="1.4" />
        <circle cx="60" cy="22" r="1.8" fill="#EF4444" stroke="#1C1917" strokeWidth="1" />
      </g>
    </svg>
  );
}
