import IconButton from "./IconButton";

export default function FrameButton({
  onClick,
  isActive,
}: {
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <IconButton onClick={onClick} isActive={isActive} title="Frame (F)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Simple rectangle frame with extended corner lines */}
        <rect x="4" y="4" width="12" height="12" fill="none" />
        
        {/* Top-left corner */}
        <line x1="2" y1="4" x2="6" y2="4" />
        <line x1="4" y1="2" x2="4" y2="6" />
        
        {/* Top-right corner */}
        <line x1="14" y1="4" x2="18" y2="4" />
        <line x1="16" y1="2" x2="16" y2="6" />
        
        {/* Bottom-left corner */}
        <line x1="2" y1="16" x2="6" y2="16" />
        <line x1="4" y1="14" x2="4" y2="18" />
        
        {/* Bottom-right corner */}
        <line x1="14" y1="16" x2="18" y2="16" />
        <line x1="16" y1="14" x2="16" y2="18" />
      </svg>
    </IconButton>
  );
}
