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
        <div className="flex gap-3">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-black/5"
              loading="lazy"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gray-100 ring-1 ring-black/5" />
          )}
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-blue-600">{item.title}</div>
            <div className="mt-1 text-xs text-gray-500">
              {item.source || "News"} • {timeAgo(item.publishedAt)}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

