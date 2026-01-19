import { motion } from "framer-motion";
import { timeAgo } from "../lib/time.js";

export default function NewsCard({ item, onOpen }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="w-full text-left"
      type="button"
      onClick={onOpen}
    >
      <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">

        {/* Title */}
        <div className="text-[14px] font-semibold text-blue-700">
          {item.title}
        </div>

        {/* Source + Time */}
        <div className="mt-1 text-xs text-gray-500">
          {item.source || "Saudi News"} • {timeAgo(item.publishedAt)}
        </div>

        {/* Snippet */}
        <div className="mt-2 text-sm text-gray-700 line-clamp-2">
          {item.snippet || "Tap to read full article"}
        </div>

      </div>
    </motion.button>
  );
}
