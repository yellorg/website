import React from 'react';

interface IconExternalLinkProps {
  width?: number;
  height?: number;
  className?: string;
}

function IconExternalLink({width = 13.5, height = 13.5, className = 'iconExternalLink'}: IconExternalLinkProps): JSX.Element {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.25 12.25H1.75V1.75H7V0.25H1.75C0.9175 0.25 0.25 0.925 0.25 1.75V12.25C0.25 13.075 0.9175 13.75 1.75 13.75H12.25C13.075 13.75 13.75 13.075 13.75 12.25V7H12.25V12.25ZM8.5 0.25V1.75H11.1925L3.82 9.1225L4.8775 10.18L12.25 2.8075V5.5H13.75V0.25H8.5Z"
        fill="white"
      />
    </svg>
  );
}

export default IconExternalLink;
