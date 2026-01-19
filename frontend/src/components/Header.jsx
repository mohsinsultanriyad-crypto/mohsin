export default function Header() {
  return (
    <div className="sticky top-0 z-20 bg-white border-b">
      <div className="flex items-center gap-3 px-4 py-3">
        
        {/* Logo Box */}
        <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>

        {/* Title */}
        <div>
          <div className="text-lg font-extrabold text-gray-900">
            SAUDI <span className="text-green-600">JOB</span>
          </div>
          <div className="text-xs tracking-wide text-gray-500">
            KINGDOM OF SAUDI ARABIA
          </div>
        </div>

      </div>
    </div>
  );
}