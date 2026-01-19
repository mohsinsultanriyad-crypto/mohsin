export default function Toggle({ value, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-black/5"
    >
      <div className="text-sm font-semibold text-gray-800">{label}</div>
      <div
        className={[
          "h-6 w-11 rounded-full p-1 transition",
          value ? "bg-blue-600" : "bg-gray-300"
        ].join(" ")}
      >
        <div
          className={[
            "h-4 w-4 rounded-full bg-white transition",
            value ? "translate-x-5" : "translate-x-0"
          ].join(" ")}
        />
      </div>
    </button>
  );
}
