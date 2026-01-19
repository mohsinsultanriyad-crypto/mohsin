export default function Empty({ title, desc }) {
  return (
    <div className="py-10 text-center">
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      {desc ? <div className="mt-2 text-sm text-gray-500">{desc}</div> : null}
    </div>
  );
}
