export default function MultiSelect({ options, value, onChange }) {
  const set = new Set(value || []);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = set.has(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => {
              const next = new Set(set);
              if (next.has(opt)) next.delete(opt);
              else next.add(opt);
              onChange(Array.from(next));
            }}
            className={[
              "rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-black/5 transition",
              active ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-700"
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
