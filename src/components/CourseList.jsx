// src/components/CourseList.jsx
import React, { useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { motion } from 'framer-motion';
import { Folder, FileText } from 'lucide-react';
import EmptyState from './EmptyState';
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
      <EmptyState
        icon={Folder}
        title="Aucune matière"
        message="Commencez par créer une matière pour y organiser vos cours."
      />
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
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">
              {subject.name}
            </h2>
            {subjectCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subjectCourses.map(course => (
                  <motion.button
                    key={course.id}
                    className="glass-card p-6 text-left w-full h-full flex items-center justify-center text-center font-semibold"
                    onClick={() => onCourseSelect(course)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {course.title}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="py-4">
                <EmptyState
                  icon={FileText}
                  title="Aucun cours"
                  message="Ajoutez votre premier cours dans cette matière."
                />
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

export default CourseList;
