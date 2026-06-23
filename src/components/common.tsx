export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-md bg-white px-3 py-2 text-center">
      <p className="text-xl font-semibold text-[#18211d]">{value}</p>
      <p className="text-xs font-medium text-[#64756d]">{label}</p>
    </div>
  );
}

export function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "rounded-md bg-[#18211d] px-4 py-2 text-sm font-semibold text-white"
          : "rounded-md px-4 py-2 text-sm font-semibold text-[#64756d] transition hover:text-[#18211d]"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "rounded-md bg-[#18211d] px-3 py-2 text-sm font-semibold text-white"
          : "rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#64756d] transition hover:border-[#b4c0b8] hover:text-[#18211d]"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
