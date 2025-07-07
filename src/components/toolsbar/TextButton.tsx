import { AiOutlineFontSize } from "react-icons/ai";
import IconButton from "./IconButton";

export default function TextButton({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <IconButton isActive={isActive} onClick={onClick} title="Text (T)">
      <AiOutlineFontSize className="h-5 w-5" />
    </IconButton>
  );
}
