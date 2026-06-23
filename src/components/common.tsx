export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-md bg-white px-3 py-2 text-center">
      <p className="text-xl font-semibold text-[#202124]">{value}</p>
      <p className="text-xs font-medium text-[#7a828e]">{label}</p>
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
          ? "rounded-md bg-[#202124] px-4 py-2 text-sm font-semibold text-white"
          : "rounded-md px-4 py-2 text-sm font-semibold text-[#5f6673] transition hover:text-[#202124]"
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
          ? "rounded-md bg-[#202124] px-3 py-2 text-sm font-semibold text-white"
          : "rounded-md border border-[#d7dce5] bg-white px-3 py-2 text-sm font-medium text-[#5f6673] transition hover:border-[#9aa7bd] hover:text-[#202124]"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
