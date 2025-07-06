import IconButton from "./IconButton";
import { AiOutlineZoomIn } from "react-icons/ai";

export default function ZoomInButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <IconButton onClick={onClick} disabled={disabled}>
      <AiOutlineZoomIn size={22} color="#888888" />
    </IconButton>
  );
}
