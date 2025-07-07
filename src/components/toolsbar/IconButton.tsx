export default function IconButton({
  onClick,
  children,
  isActive,
  disabled,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      className={`flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:enabled:text-gray-700 focus:enabled:text-gray-700 active:enabled:text-gray-900 disabled:cursor-default disabled:opacity-50 ${isActive ? "bg-blue-500 text-white hover:enabled:bg-blue-500 hover:enabled:text-white focus:enabled:bg-blue-500 focus:enabled:text-white active:enabled:bg-blue-500 active:enabled:text-white" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
