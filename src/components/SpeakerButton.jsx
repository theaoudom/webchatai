'use client';

import React from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { FaVolumeUp, FaStopCircle } from 'react-icons/fa';

const SpeakerButton = ({ text }) => {
  const { isSpeaking, handleToggleSpeak } = useTextToSpeech(text);

  return (
    <button
      onClick={handleToggleSpeak}
      className="hover:text-white transition-colors"
      aria-label={isSpeaking ? 'Stop speaking' : 'Start speaking'}
    >
      {isSpeaking ? <FaStopCircle className="text-blue-500" /> : <FaVolumeUp />}
    </button>
  );
};

export default SpeakerButton;
