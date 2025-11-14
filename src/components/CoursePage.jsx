import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataSync } from '../context/DataSyncContext';
import { ArrowLeft, Edit } from 'lucide-react';
import Header from './Header';
import DOMPurify from 'dompurify';
import { marked } from 'marked'; // Using 'marked' to convert Markdown to HTML
import './CourseViewer.css'; // Import the new custom styles

const CoursePage = () => {
  const { courseId } = useParams();
  const { courses } = useDataSync();
  const navigate = useNavigate();

  // Find the course
  const course = courses?.find(c => c.id.toString() === courseId);

  useEffect(() => {
    // Optional: Add a class to body for page-specific styles if needed
    document.body.classList.add('course-page-active');
    return () => document.body.classList.remove('course-page-active');
  }, []);

  if (!course) {
    return (
      <>
        <Header />
        <main className="main-content text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Cours non trouvé</h2>
          <p className="text-muted-foreground mb-8">Ce cours n'existe pas ou a été supprimé.</p>
          <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            Retour à l'accueil
          </button>
        </main>
      </>
    );
  }

  // Convert Markdown to HTML and sanitize it
  const sanitizedHtml = DOMPurify.sanitize(marked.parse(course.content || ''));

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button onClick={() => navigate('/')} className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
        </div>

        <div className="bg-card p-8 sm:p-10 rounded-xl border border-border shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-6">{course.title}</h1>
          <div
            className="course-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </div>
      </main>
    </div>
  );
};

export default CoursePage;
