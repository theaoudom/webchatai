'use client';

import { useState, useEffect } from 'react';
import { ttsManager } from '../utils/textToSpeech';

export const useTextToSpeech = (text) => {
  const [ttsState, setTtsState] = useState(ttsManager.getState());

  useEffect(() => {
    const unsubscribe = ttsManager.subscribe(setTtsState);
    return unsubscribe;
  }, []);

  const isSpeaking = ttsState.isSpeaking && ttsState.speakingText === text;

  const handleToggleSpeak = () => {
    ttsManager.speak(text);
  };

  return {
    isSpeaking,
    handleToggleSpeak,
  };
};
