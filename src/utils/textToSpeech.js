class TextToSpeechManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.listeners = new Set();
    this.speakingText = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  getState() {
    return {
      isSpeaking: this.speakingText !== null,
      speakingText: this.speakingText,
    };
  }

  speak(text) {
    if (!this.synth) return;

    // If the requested text is already speaking, stop it.
    if (this.speakingText === text) {
      this.synth.cancel();
      this.speakingText = null;
      this.notify();
      return;
    }

    // If something else is speaking, stop it before starting the new one.
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    this.speakingText = text;

    utterance.onend = () => {
      // Ensure we only clear the state if the utterance that ended is the one we think is speaking.
      if (this.speakingText === text) {
        this.speakingText = null;
        this.notify();
      }
    };

    utterance.onerror = (event) => {
      if (this.speakingText === text) {
        this.speakingText = null;
        console.error(`Speech synthesis error: ${event.error}`);
        this.notify();
      }
    };

    this.synth.speak(utterance);
    this.notify(); // Notify immediately for a responsive UI.
  }
}

export const ttsManager = new TextToSpeechManager();
