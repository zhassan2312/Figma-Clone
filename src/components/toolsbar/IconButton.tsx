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
      className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded-md text-gray-500 hover:enabled:text-gray-700 focus:enabled:text-gray-700 active:enabled:text-gray-900 disabled:cursor-default disabled:opacity-50 ${isActive ? "bg-blue-600 text-white hover:enabled:bg-blue-700 hover:enabled:text-white focus:enabled:bg-blue-700 focus:enabled:text-white active:enabled:bg-blue-800 active:enabled:text-white" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
