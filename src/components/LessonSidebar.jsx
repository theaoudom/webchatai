import Link from 'next/link';

export default function LessonSidebar({ lessons, currentLessonId, language }) {
  if (!lessons || lessons.length === 0) {
    return null;
  }

  return (
    <aside className="w-full md:w-1/4 p-6 bg-white rounded-2xl shadow-xl h-full self-start sticky top-24">
      {language && (
        <Link href={`/learnWithMe/${language}`} className="block mb-6 text-center px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-all">
            &larr; Back to Levels
        </Link>
      )}
      <h3 className="text-2xl font-extrabold mb-6 text-gray-800 border-b-2 pb-2">Lessons</h3>
      <nav>
        <ul>
          {lessons.map(lesson => (
            <li key={lesson.id} className="mb-2">
              <Link href={`/learnWithMe/lesson/${lesson.id}`}>
                <div
                  className={`block p-4 rounded-lg text-lg transition-all transform hover:scale-105 ${
                    lesson.id === currentLessonId
                      ? 'bg-green-500 text-white font-bold shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-green-100'
                  }`}
                >
                  {lesson.title}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
