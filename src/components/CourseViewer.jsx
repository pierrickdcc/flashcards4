// src/components/CourseViewer.jsx
import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIState } from '../context/UIStateContext';

const CourseViewer = ({ course, onClose }) => {
  const { darkMode } = useUIState();

  if (!course) {
    return null;
  }

  // Styles améliorés pour l'iframe, avec une meilleure gestion des thèmes
  const iframeStyles = `
    <style>
      :root {
        --bg-color-light: #ffffff;
        --text-color-light: #111827;
        --bg-color-dark: #111827;
        --text-color-dark: #f9fafb;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.7;
        padding: 2rem;
        background-color: ${darkMode ? 'var(--bg-color-dark)' : 'var(--bg-color-light)'};
        color: ${darkMode ? 'var(--text-color-dark)' : 'var(--text-color-light)'};
        transition: background-color 0.3s, color 0.3s;
      }
      h1, h2, h3 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }
      p {
        margin-bottom: 1em;
      }
      a {
        color: #3b82f6;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      * {
        color: inherit;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }
    </style>
  `;
  const iframeContent = `${iframeStyles}${course.content}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate pr-4">
              {course.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-grow w-full h-full bg-transparent">
            <iframe
              srcDoc={iframeContent}
              sandbox="allow-same-origin allow-scripts" // Plus permissif si le contenu a du JS
              className="w-full h-full border-none bg-transparent"
              title={course.title}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseViewer;
