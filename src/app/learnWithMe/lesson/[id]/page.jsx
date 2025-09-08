'use client'; 

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getLessonById, getCurriculum } from '../../../../service/curriculumService';
import LessonFooter from '../../../../components/LessonFooter';
import VocabularyFlashcards from '../../../../components/VocabularyFlashcards';
import QuizComponent from '../../../../components/QuizComponent';
import AiChatComponent from '../../../../components/AiChatComponent';
import SpeakingPractice from '../../../../components/SpeakingPractice';
import ListeningComponent from '../../../../components/ListeningComponent';
import LessonSidebar from '../../../../components/LessonSidebar';

const ReadingComponent = ({ lesson }) => (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reading Practice</h2>
      <div className="p-4 bg-gray-100 rounded-md mb-6 whitespace-pre-line text-lg leading-loose">
        {lesson.content}
      </div>
      <div className="space-y-6">
        {lesson.questions.map((q, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-md">
            <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
            {/* Note: This is a simple display. A real quiz would hide the answer. */}
            <div className="flex flex-col space-y-2">
                {q.options.map(opt => (
                    <button key={opt} className={`w-full text-left p-2 border rounded ${ q.answer === opt ? 'bg-green-100' : ''}`}>
                        {opt}
                    </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
);

const GrammarLesson = ({ lesson }) => (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Grammar Explanation</h2>
      <p className="mb-6">{lesson.explanation}</p>
      <h3 className="text-xl font-semibold mb-3">Examples:</h3>
      <ul className="space-y-3">
        {lesson.examples.map((example, index) => (
          <li key={index} className="p-3 bg-gray-50 rounded-md">
            <p className="font-bold text-lg">{example.korean || example.english}</p>
            {example.korean && example.english && <p className="text-gray-700">{example.english}</p>}
          </li>
        ))}
      </ul>
    </div>
  );

// The Main Page Component
export default function LessonPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [lesson, setLesson] = useState(null);
  const [siblingLessons, setSiblingLessons] = useState([]);
  const [activePractice, setActivePractice] = useState(null);

  useEffect(() => {
    const lessonData = getLessonById(id);
    setLesson(lessonData);
    setActivePractice(null);
    if (lessonData) {
        const curriculum = getCurriculum(lessonData.language);
        const allLessons = curriculum?.[lessonData.level] || [];
        setSiblingLessons(allLessons);
    } else {
        setSiblingLessons([]);
    }
  }, [id]);

  if (!lesson) {
    return <div className="p-8 text-center">Loading lesson...</div>;
  }

  const currentIndex = siblingLessons.findIndex(l => l.id === lesson.id);
  const nextLesson = currentIndex !== -1 && currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'vocabulary':
        return <VocabularyFlashcards lesson={lesson} />;
      case 'grammar':
        return <GrammarLesson lesson={lesson} />;
      case 'quiz':
        return <QuizComponent lesson={lesson} />;
      case 'listening':
        return <ListeningComponent lesson={lesson} />;
      case 'reading':
        return <ReadingComponent lesson={lesson} />;
      default:
        return <p>Unsupported lesson type.</p>;
    }
  };

  return (
    <div className="container mx-auto p-8 flex flex-col md:flex-row gap-8">
        <LessonSidebar lessons={siblingLessons} currentLessonId={lesson.id} language={lesson.language} />
        <main className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
                {prevLesson ? (
                    <Link href={`/learnWithMe/lesson/${prevLesson.id}`} replace className="flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 hover:shadow-lg transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Previous
                    </Link>
                ) : (
                    <div /> // Placeholder to keep Next button on the right
                )}
                {nextLesson && (
                    <Link href={`/learnWithMe/lesson/${nextLesson.id}`} replace className="flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition-all">
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </Link>
                )}
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-2">{lesson.title}</h1>
                <p className="text-xl text-gray-500 mb-8 capitalize">
                    {lesson.language} - {lesson.level} Lesson
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                    {renderLessonContent()}
                </div>
                <LessonFooter lessonId={lesson.id} />
            </div>

            <div className="mt-12 text-center flex justify-center space-x-6">
                <button 
                    onClick={() => setActivePractice(activePractice === 'chat' ? null : 'chat')}
                    className={`font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 ${activePractice === 'chat' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-purple-600 shadow-md'}`}
                >
                    🤖 AI Chat Practice
                </button>
                <button 
                    onClick={() => setActivePractice(activePractice === 'speaking' ? null : 'speaking')}
                    className={`font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 ${activePractice === 'speaking' ? 'bg-teal-500 text-white shadow-lg' : 'bg-white text-teal-500 shadow-md'}`}
                >
                    🎤 AI Speaking Practice
                </button>
            </div>

            {activePractice === 'chat' && (
                <div className="mt-8 bg-white p-8 rounded-2xl shadow-xl">
                    <AiChatComponent lesson={lesson} />
                </div>
            )}
            {activePractice === 'speaking' && (
                <div className="mt-8 bg-white p-8 rounded-2xl shadow-xl">
                    <SpeakingPractice lesson={lesson} />
                </div>
            )}
        </main>
    </div>
  );
}