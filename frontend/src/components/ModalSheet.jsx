import { motion, AnimatePresence } from "framer-motion";

export default function ModalSheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md"
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <div className="mx-3 mb-3 rounded-3xl bg-white shadow-soft ring-1 ring-black/10">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">{title}</div>
                <button
                  className="rounded-xl px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto px-4 pb-4">{children}</div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
