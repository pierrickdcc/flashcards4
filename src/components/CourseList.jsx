// src/components/CourseList.jsx
import React, { useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { motion } from 'framer-motion';
import { DEFAULT_SUBJECT } from '../constants/app';

const CourseList = ({ onCourseSelect }) => {
  const { courses, subjects } = useDataSync();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const sortedSubjects = useMemo(() => {
    return (subjects || []).sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects]);

  if (!subjects || subjects.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-gray-400">
        Aucune matière à afficher.
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {sortedSubjects.map(subject => {
        const subjectCourses = (courses || []).filter(c => c.subject === subject.name);

        return (
          <div key={subject.id}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b-2 border-blue-500 pb-2">
              {subject.name}
            </h2>
            {subjectCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subjectCourses.map(course => (
                  <motion.button
                    key={course.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-left w-full h-full flex items-center justify-center text-center font-semibold text-gray-700 dark:text-gray-200"
                    onClick={() => onCourseSelect(course)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {course.title}
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun cours dans cette matière pour le moment</p>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

export default CourseList;
