'use client';

import React, { useState, useEffect } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const MicrophoneButton = ({ onTranscriptChange }) => {
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange, isMounted]);

  const handleToggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!isMounted) {
    return (
      <button
        className="p-2 rounded-full bg-gray-700 text-gray-400 cursor-not-allowed"
        disabled
        aria-label="Loading speech recognition"
      >
        <FaMicrophone />
      </button>
    );
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <span className="text-red-500 text-xs">
        Speech recognition not supported in this browser.
      </span>
    );
  }

  return (
    <button
      onClick={handleToggleListening}
      className={`p-2 rounded-full transition-colors ${
        listening
          ? 'bg-red-600 text-white animate-pulse-fast'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      aria-label={listening ? 'Stop listening' : 'Start listening'}
    >
      {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
    </button>
  );
};

export default MicrophoneButton;
