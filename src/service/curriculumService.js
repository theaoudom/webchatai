import koreanCurriculum from '../data/korean.json';
import englishCurriculum from '../data/english.json';

const curriculums = {
  korean: koreanCurriculum,
  english: englishCurriculum,
};

export function getCurriculum(language) {
  return curriculums[language] || null;
}

export function getLessonById(id) {
  for (const langKey in curriculums) {
    const curriculum = curriculums[langKey];
    for (const levelKey in curriculum) {
      const lessons = curriculum[levelKey];
      if (Array.isArray(lessons)) {
        const lesson = lessons.find(lesson => lesson.id === id);
        if (lesson) {
          return { ...lesson, language: langKey, level: levelKey };
        }
      }
    }
  }
  return null;
}
