/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";

interface TutorLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

const TutorLogo: React.FC<TutorLogoProps> = ({
  size = 32,
  className = "",
  showText = true,
}) => {
  return (
    <div
      className={`tutor-logo ${className}`}
      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#1a73e8", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#2c3e50", stopOpacity: 1 }}
            />
          </linearGradient>
          <linearGradient id="penGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#e67e22", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#d35400", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>

        {/* Book Base */}
        <rect
          x="8"
          y="16"
          width="36"
          height="40"
          rx="2"
          ry="2"
          fill="url(#bookGradient)"
        />

        {/* Book Pages */}
        <rect
          x="12"
          y="20"
          width="28"
          height="32"
          rx="1"
          ry="1"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Book Spine */}
        <rect x="8" y="16" width="4" height="40" rx="2" ry="2" fill="#2c3e50" />

        {/* Calendar/Schedule Lines */}
        <line
          x1="16"
          y1="26"
          x2="36"
          y2="26"
          stroke="#1a73e8"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <line
          x1="16"
          y1="30"
          x2="32"
          y2="30"
          stroke="#1a73e8"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <line
          x1="16"
          y1="34"
          x2="34"
          y2="34"
          stroke="#1a73e8"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <line
          x1="16"
          y1="38"
          x2="30"
          y2="38"
          stroke="#1a73e8"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <line
          x1="16"
          y1="42"
          x2="36"
          y2="42"
          stroke="#1a73e8"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* Clock/Time indicator */}
        <circle cx="50" cy="24" r="8" fill="#27ae60" opacity="0.9" />
        <circle cx="50" cy="24" r="6" fill="#ffffff" />
        <line
          x1="50"
          y1="24"
          x2="50"
          y2="20"
          stroke="#27ae60"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="24"
          x2="53"
          y2="24"
          stroke="#27ae60"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Pen/Pencil */}
        <rect
          x="44"
          y="42"
          width="16"
          height="3"
          rx="1.5"
          ry="1.5"
          fill="url(#penGradient)"
          transform="rotate(30 52 43.5)"
        />
        <polygon
          points="58,48 60,50 58,52"
          fill="#d35400"
          transform="rotate(30 59 50)"
        />

        {/* Graduation Cap (Education symbol) */}
        <path d="M20 10 L32 6 L44 10 L32 14 Z" fill="#2c3e50" />
        <path
          d="M20 10 L22 12 L22 16 L30 18 L42 16 L42 12 L44 10"
          fill="#34495e"
          opacity="0.8"
        />
        <rect x="42" y="8" width="2" height="8" fill="#2c3e50" />
        <rect x="42" y="8" width="6" height="2" fill="#2c3e50" />
      </svg>

      {showText && (
        <span
          className="logo-text"
          style={{
            fontWeight: 600,
            fontSize: size > 32 ? "1.2rem" : "1rem",
            color: "var(--text-header)",
            whiteSpace: "nowrap",
          }}
        >
          TutorApp
        </span>
      )}
    </div>
  );
};

export default TutorLogo;
