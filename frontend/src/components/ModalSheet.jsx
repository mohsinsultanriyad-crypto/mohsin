import { motion, AnimatePresence } from "framer-motion";

export default function ModalSheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* TOP SHEET */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md pt-3"
            initial={{ y: -500 }}
            animate={{ y: 0 }}
            exit={{ y: -500 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="mx-3 rounded-3xl bg-white shadow-soft ring-1 ring-black/10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">{title}</div>
                <button
                  className="rounded-xl px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                  onClick={onClose}
                  type="button"
                >
                  Close
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
