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
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Frame icon - representing a container/frame */}
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" />
        <path d="M8 8h8v8H8z" fill="none" strokeDasharray="2,2" />
        
        {/* Corner indicators */}
        <rect x="2" y="2" width="4" height="1" fill="currentColor" />
        <rect x="2" y="2" width="1" height="4" fill="currentColor" />
        
        <rect x="18" y="2" width="4" height="1" fill="currentColor" />
        <rect x="21" y="2" width="1" height="4" fill="currentColor" />
        
        <rect x="2" y="18" width="1" height="4" fill="currentColor" />
        <rect x="2" y="21" width="4" height="1" fill="currentColor" />
        
        <rect x="21" y="18" width="1" height="4" fill="currentColor" />
        <rect x="18" y="21" width="4" height="1" fill="currentColor" />
      </svg>
    </IconButton>
  );
}
