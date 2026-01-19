export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white shadow-soft ring-1 ring-black/5 ${className}`}>
      {children}
    </div>
  );
}
