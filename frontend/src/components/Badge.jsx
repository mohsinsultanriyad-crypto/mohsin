export default function Badge({ value }) {
  if (!value || value <= 0) return null;
  const text = value > 99 ? "99+" : String(value);
  return (
    <span className="absolute -top-2 -right-2 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[11px] font-semibold text-white">
      {text}
    </span>
  );
}
