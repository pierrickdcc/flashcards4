import React, { useState } from 'react';
import { Plus, X, FilePlus, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Example handlers - these would eventually trigger modals
  const handleAddCard = () => {
    console.log('Add Card clicked');
    setIsOpen(false);
  };

  const handleAddCourse = () => {
    console.log('Add Course clicked');
    setIsOpen(false);
  };

  const menuVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="fixed bottom-20 right-5 z-50 md:bottom-8 md:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col items-end gap-3 mb-4"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <span className="bg-card px-3 py-1 rounded-md text-sm shadow-lg">Ajouter un cours</span>
              <button onClick={handleAddCourse} className="btn-fab btn-secondary p-3">
                <Book size={20} />
              </button>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <span className="bg-card px-3 py-1 rounded-md text-sm shadow-lg">Ajouter une carte</span>
              <button onClick={handleAddCard} className="btn-fab btn-secondary p-3">
                <FilePlus size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary btn-fab"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          <Plus size={24} />
        </motion.div>
      </button>
    </div>
  );
};

export default FloatingActionButton;
