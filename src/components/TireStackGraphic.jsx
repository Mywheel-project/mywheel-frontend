export default function TireStackGraphic({className}) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 타이어 메탈릭/고무 그라데이션 */}
        <linearGradient id="tGradDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2B30" />
          <stop offset="50%" stopColor="#151618" />
          <stop offset="100%" stopColor="#0B0B0C" />
        </linearGradient>

        <linearGradient id="tHighlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#151618" />
          <stop offset="30%" stopColor="#3C3F47" />
          <stop offset="70%" stopColor="#25262B" />
          <stop offset="100%" stopColor="#101113" />
        </linearGradient>

        <radialGradient id="tSideGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0F1012" />
          <stop offset="80%" stopColor="#1C1D21" />
          <stop offset="100%" stopColor="#32343B" />
        </radialGradient>
      </defs>

      {/* 그림자 */}
      <ellipse
        cx="260"
        cy="480"
        rx="190"
        ry="16"
        fill="rgba(0,0,0,0.15)"
      />

      {/* 중앙 타이어 스택 */}

      {/* 1층 타이어 */}
      <g transform="translate(140, 360)">
        <rect
          width="210"
          height="95"
          rx="20"
          fill="url(#tHighlight)"
          stroke="#111"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="48"
          x2="200"
          y2="48"
          stroke="#111"
          strokeWidth="4"
        />

        {[25, 60, 95, 130, 165, 195].map((x, i) => (
          <path
            key={i}
            d={`M ${x} 10 L ${x + 6} 45 M ${x + 6} 50 L ${x} 85`}
            stroke="#000"
            strokeWidth="3"
            opacity="0.7"
          />
        ))}
      </g>

      {/* 2층 타이어 */}
      <g transform="translate(145, 275)">
        <rect
          width="200"
          height="92"
          rx="18"
          fill="url(#tHighlight)"
          stroke="#111"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="46"
          x2="190"
          y2="46"
          stroke="#111"
          strokeWidth="4"
        />

        {[25, 58, 92, 125, 158, 185].map((x, i) => (
          <path
            key={i}
            d={`M ${x} 8 L ${x + 5} 43 M ${x + 5} 48 L ${x} 84`}
            stroke="#000"
            strokeWidth="3"
            opacity="0.7"
          />
        ))}
      </g>

      {/* 3층 타이어 */}
      <g transform="translate(148, 190)">
        <rect
          width="195"
          height="92"
          rx="18"
          fill="url(#tHighlight)"
          stroke="#111"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="46"
          x2="185"
          y2="46"
          stroke="#111"
          strokeWidth="4"
        />

        {[25, 58, 92, 125, 158, 180].map((x, i) => (
          <path
            key={i}
            d={`M ${x} 8 L ${x + 5} 43 M ${x + 5} 48 L ${x} 84`}
            stroke="#000"
            strokeWidth="3"
            opacity="0.7"
          />
        ))}
      </g>

      {/* 4층 타이어 */}
      <g transform="translate(150, 105)">
        <rect
          width="190"
          height="92"
          rx="18"
          fill="url(#tHighlight)"
          stroke="#111"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="46"
          x2="180"
          y2="46"
          stroke="#111"
          strokeWidth="4"
        />

        {[25, 58, 92, 125, 158, 175].map((x, i) => (
          <path
            key={i}
            d={`M ${x} 8 L ${x + 5} 43 M ${x + 5} 48 L ${x} 84`}
            stroke="#000"
            strokeWidth="3"
            opacity="0.7"
          />
        ))}
      </g>

      {/* 좌측 세워진 타이어 */}
      <g transform="translate(30, 240)">
        <ellipse
          cx="80"
          cy="115"
          rx="72"
          ry="115"
          fill="url(#tHighlight)"
          stroke="#09090A"
          strokeWidth="3"
        />

        <ellipse
          cx="80"
          cy="115"
          rx="52"
          ry="85"
          fill="url(#tSideGrad)"
        />

        <ellipse
          cx="80"
          cy="115"
          rx="28"
          ry="48"
          fill="#D9D9D9"
        />
      </g>

      {/* 우측 비스듬히 기댄 타이어 */}
      <g transform="translate(330, 220) rotate(22 65 125)">
        <rect
          width="130"
          height="235"
          rx="22"
          fill="url(#tHighlight)"
          stroke="#111"
          strokeWidth="3"
        />

        <line
          x1="65"
          y1="10"
          x2="65"
          y2="225"
          stroke="#111"
          strokeWidth="5"
        />

        {[30, 60, 90, 120, 150, 180, 210].map((y, i) => (
          <g key={i}>
            <line
              x1="15"
              y1={y}
              x2="60"
              y2={y + 8}
              stroke="#000"
              strokeWidth="3"
              opacity="0.7"
            />
            <line
              x1="70"
              y1={y + 8}
              x2="115"
              y2={y}
              stroke="#000"
              strokeWidth="3"
              opacity="0.7"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}