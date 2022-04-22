import React from 'react';

interface IconChevronUpProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

function IconChevronUp({
  width = 24,
  height = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
}: IconChevronUpProps): JSX.Element {
  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 15L12 8L19 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default IconChevronUp;
