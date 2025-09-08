const isBrowser = () => typeof window !== 'undefined';
const PROGRESS_KEY = 'languageAppProgress';

// Helper function to check if a date was yesterday
const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
};

// Helper function to check if a date is today
const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
};

// Gets the entire progress object from localStorage with defaults
export const getProgress = () => {
  if (isBrowser()) {
    const progress = localStorage.getItem(PROGRESS_KEY);
    const defaults = { completedLessons: [], points: 0, streak: 0, lastCompleted: null };
    return progress ? { ...defaults, ...JSON.parse(progress) } : defaults;
  }
  return { completedLessons: [], points: 0, streak: 0, lastCompleted: null };
};

// Saves the entire progress object to localStorage
const saveProgress = (progress) => {
  if (isBrowser()) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('progressUpdated'));
  }
};

// Checks if a specific lesson ID is marked as complete
export const isLessonComplete = (lessonId) => {
  const progress = getProgress();
  return progress.completedLessons.includes(lessonId);
};

// The core logic for gamification is now in this function
export const markLessonAsComplete = (lessonId) => {
  const progress = getProgress();
  
  // Only award points/streaks for the FIRST time a lesson is completed
  if (progress.completedLessons.includes(lessonId)) {
    return; // Do nothing if already complete
  }

  // --- Update Lesson Completion ---
  progress.completedLessons.push(lessonId);

  // --- Update Points ---
  progress.points += 10; // Award 10 points for a new lesson

  // --- Update Streak ---
  const lastCompletedDate = progress.lastCompleted ? new Date(progress.lastCompleted) : null;
  const today = new Date();

  if (lastCompletedDate) {
    if (isYesterday(lastCompletedDate)) {
      // Continued the streak
      progress.streak += 1;
    } else if (!isToday(lastCompletedDate)) {
      // Streak was broken
      progress.streak = 1;
    }
    // If it's the same day, streak doesn't change
  } else {
    // First lesson ever completed
    progress.streak = 1;
  }
  
  progress.lastCompleted = today.toISOString();

  saveProgress(progress);
};