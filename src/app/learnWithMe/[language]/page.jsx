import Link from 'next/link';
import { getCurriculum } from '../../../service/curriculumService';

const levels = [
    { name: 'Beginner', key: 'beginner', description: 'Start your journey', bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
    { name: 'Intermediate', key: 'intermediate', description: 'Build your skills', bgColor: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600' },
    { name: 'Advanced', key: 'advanced', description: 'Master the language', bgColor: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
];

// The language is passed via URL params
export default function LanguageLevelsPage({ params }) {
  const { language } = params;
  const curriculum = getCurriculum(language);

  // Find the first lesson ID for a given level
  const getFirstLessonId = (levelKey) => {
    const lessons = curriculum[levelKey];
    return lessons && lessons.length > 0 ? lessons[0].id : null;
  };

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <h1 className="text-5xl font-extrabold text-center mb-4 text-gray-800 capitalize">
        Learn {language}
      </h1>
      <p className="text-xl text-center text-gray-500 mb-12">Select your level to begin.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {levels.map(level => {
          const firstLessonId = getFirstLessonId(level.key);
          const levelContent = (
            <div className={`p-10 rounded-2xl shadow-lg text-white text-center transition-all ${firstLessonId ? `transform hover:scale-105 hover:shadow-2xl ${level.bgColor} ${level.hoverColor} cursor-pointer` : 'bg-gray-400 cursor-not-allowed'}`}>
              <h2 className="text-4xl font-bold mb-2">{level.name}</h2>
              <p className="text-lg">{firstLessonId ? level.description : 'Coming Soon!'}</p>
            </div>
          );

          return firstLessonId ? (
            <Link key={level.name} href={`/learnWithMe/lesson/${firstLessonId}`}>
              {levelContent}
            </Link>
          ) : (
            <div key={level.name}>
              {levelContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}