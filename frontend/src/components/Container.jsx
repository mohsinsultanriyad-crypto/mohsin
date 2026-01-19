export default function Container({ children }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-4 safe-bottom">
      {children}
    </div>
  );
}
