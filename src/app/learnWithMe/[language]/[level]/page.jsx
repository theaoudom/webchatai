import { redirect } from 'next/navigation';
import curriculum from '../../../../data/curriculum.json';

// This function gets the lessons for a given language and level.
async function getLessons(language, level) {
  return curriculum[language]?.[level] || [];
}

export default async function LevelPage({ params }) {
  const { language, level } = params;
  const lessons = await getLessons(language, level);

  // If there are lessons, redirect to the first one.
  if (lessons.length > 0) {
    const firstLessonId = lessons[0].id;
    redirect(`/learnWithMe/lesson/${firstLessonId}`);
  }

  // If no lessons are found, display a user-friendly message.
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Coming Soon!</h1>
      <p className="text-lg text-gray-600">
        We are working hard to create lessons for the {level} level of {language}. 
        Please check back later!
      </p>
    </div>
  );
}