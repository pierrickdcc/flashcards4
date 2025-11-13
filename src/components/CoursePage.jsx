import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataSync } from '../context/DataSyncContext';
import { ArrowLeft } from 'lucide-react';
import Header from './Header'; // Re-using the header for consistency
import DOMPurify from 'dompurify';

const CoursePage = () => {
  const { courseId } = useParams();
  const { courses } = useDataSync();
  const navigate = useNavigate();

  // Find the course, making sure to handle potential string/number mismatch
  const course = courses?.find(c => c.id.toString() === courseId);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Cours non trouvé</h2>
        <p className="text-muted mb-8">Le cours que vous cherchez n'existe pas ou a été supprimé.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft size={18} />
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="mb-8">
          <button onClick={() => navigate('/')} className="btn-secondary">
            <ArrowLeft size={18} />
            Retour à la liste
          </button>
        </div>
        <h1 className="text-4xl font-bold mb-8">{course.title}</h1>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.content) }}
        />
      </main>
    </div>
  );
};

export default CoursePage;
