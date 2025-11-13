// src/components/CourseList.jsx
import React, { useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { motion } from 'framer-motion';
import { Folder, FileText, MoreVertical, Clock } from 'lucide-react';
import EmptyState from './EmptyState';

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

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
        const subjectCourses = (courses || []).filter(c => c.subject === subject.name)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return (
          <div key={subject.id}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">
              {subject.name}
            </h2>
            {subjectCourses.length > 0 ? (
              <motion.div
                className="glass-card table-container"
                variants={itemVariants}
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th style={{ width: '150px' }}>Dernière modification</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectCourses.map(course => (
                      <motion.tr
                        key={course.id}
                        className="cursor-pointer"
                        onClick={() => onCourseSelect(course)}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        style={{ display: 'table-row' }}
                      >
                        <td className="font-medium flex items-center gap-3">
                          <FileText size={20} className="text-primary" />
                          {course.title}
                        </td>
                        <td className="text-gray-500 dark:text-gray-400">
                          {formatDate(course.updatedAt)}
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add functionality for more options here
                            }}
                          >
                            <MoreVertical size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
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
