import { useId } from "react";

interface SparkleIconProps {
  size?: number;
  className?: string;
}

/** Estrela de quatro pontas em degradê (azul → roxo → rosa): o "brilho" que identifica a IA. */
export function SparkleIcon({ size = 18, className = "" }: SparkleIconProps) {
  const gradientId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285f4" />
          <stop offset="0.55" stopColor="#9b72cb" />
          <stop offset="1" stopColor="#d96570" />
        </linearGradient>
      </defs>
      <path
        d="M10 2c0 4.4-3.6 8-8 8 4.4 0 8 3.6 8 8 0-4.4 3.6-8 8-8-4.4 0-8-3.6-8-8z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M19 14c0 1.7-1.3 3-3 3 1.7 0 3 1.3 3 3 0-1.7 1.3-3 3-3-1.7 0-3-1.3-3-3z"
        fill={`url(#${gradientId})`}
        opacity="0.85"
      />
    </svg>
  );
}
