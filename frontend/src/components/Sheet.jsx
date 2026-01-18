import { motion, AnimatePresence } from "framer-motion";

export default function Sheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-3xl bg-white p-4 shadow-xl"
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-base font-semibold">{title}</div>
              <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-gray-500">
                Close
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
