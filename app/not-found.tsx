"use client";

import { motion } from "framer-motion";
import { SearchX, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-neutral-800"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-full">
            <SearchX className="w-10 h-10 text-gray-700 dark:text-gray-200" />
          </div>
        </motion.div>

        {/* 404 Text */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          404
        </h1>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <Home className="w-4 h-4" />
              Home
            </motion.button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}