const gtts = require('gtts');
const fs = require('fs');
const path = require('path');
const koreanCurriculum = require('./src/data/korean.json');
const englishCurriculum = require('./src/data/english.json');

const curriculumData = {
    korean: koreanCurriculum,
    english: englishCurriculum
};

const outputDir = path.join(__dirname, 'public', 'audio');
const vocabOutputDir = path.join(outputDir, 'vocab');

// Ensure the output directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(vocabOutputDir)) {
    fs.mkdirSync(vocabOutputDir, { recursive: true });
}

const generateAudio = async () => {
  console.log('Starting audio generation...');
  const languages = {
    korean: 'ko',
    english: 'en'
  };

  for (const langKey in curriculumData) {
    const curriculum = curriculumData[langKey];
    for (const levelKey in curriculum) {
      const lessons = curriculum[levelKey];
      for (const lesson of lessons) {
        const langCode = languages[langKey];
        if (!langCode) {
          console.warn(`Unsupported language for TTS: ${langKey}. Skipping.`);
          continue;
        }

        // Handle Listening Comprehension Lessons
        if (lesson.type === 'listening' && lesson.transcript && lesson.audioFile) {
          const text = lesson.transcript.replace(/\(.*?\)/g, ''); // Remove parenthetical translations
          const outputPath = path.join(__dirname, 'public', lesson.audioFile);
          
          console.log(`Generating audio for lesson: ${lesson.title} [${langCode}]`);
          await saveSpeech(text, langCode, outputPath);
        }

        // Handle Vocabulary Lessons
        if (lesson.type === 'vocabulary' && lesson.content) {
            for(const item of lesson.content) {
                if(item.word && item.audioFile) {
                    const outputPath = path.join(__dirname, 'public', item.audioFile);
                    console.log(`Generating audio for word: ${item.word} [${langCode}]`);
                    await saveSpeech(item.word, langCode, outputPath);
                }
            }
        }
      }
    }
  }
  console.log('Audio generation finished.');
};

async function saveSpeech(text, lang, path) {
    const speech = new gtts(text, lang);
    try {
      await new Promise((resolve, reject) => {
          speech.save(path, (err) => {
              if (err) {
                  reject(err);
              } else {
                  console.log(`Successfully saved: ${path}`);
                  resolve();
              }
          });
      });
    } catch (err) {
      console.error(`Error generating audio for text "${text}":`, err);
    }
}

generateAudio();
