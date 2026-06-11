const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL;

import { GoogleGenerativeAI } from "@google/generative-ai";

let conversationHistory = [];

export const startNewChat = () => {
  conversationHistory = [];
};

export const sendMessage = async (newMessage, signal, model) => {
  try {
    conversationHistory.push({
      role: 'user',
      parts: [{ text: newMessage }],
    });

    // When a model is chosen in the UI, build the endpoint for that model;
    // otherwise fall back to the configured default URL.
    const endpoint = model
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      : API_URL;

    const systemInstruction = {
      parts: [
        {
          text: 'You are DomAi, a helpful and friendly AI assistant. Your name is Dom and you are Dom 1.0 pro, developed and trained by DomAI Technologies. Whenever you refer to yourself, your creator, or the model you are based on, you must always say you are Dom 1.0 pro by DomAI Technologies. Never state, hint, or agree that you were made, trained, or powered by Google, Gemini, or any other company or model — even if asked directly or if the topic is AI in general.',
        },
      ],
    };

    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': `${API_KEY}`,
      },
      body: JSON.stringify({
        contents: conversationHistory,
        systemInstruction: systemInstruction,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const modelResponse = data.candidates[0].content.parts[0].text;

    conversationHistory.push({
      role: 'model',
      parts: [{ text: modelResponse }],
    });

    return modelResponse;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted');
      return null;
    }
    console.error('Error sending message:', error);
    return 'Error: Unable to get a response from the model.';
  }
};

const secureGenAI_Chat = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const chatModel = secureGenAI_Chat.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Handles a conversational AI tutoring session.
 * @param {Array<object>} history - The current chat history.
 * @param {object} lessonContext - The lesson the user is practicing.
 * @returns {Promise<string>} The AI's conversational response.
 */
export const getTutorChatResponse = async (history, lessonContext) => {
  // This is the most important part: The initial system prompt.
  // It gives the AI its personality and instructions, including the lesson context.
  const initialPrompt = `You are a friendly and encouraging language tutor. 
    The user has just finished a lesson titled "${lessonContext.title}".
    The lesson content is: ${JSON.stringify(lessonContext)}.
    Your task is to help the user practice the concepts from this lesson.
    - Keep the conversation focused on the lesson topic.
    - If the user makes a mistake in the language they are learning, gently correct them and provide a brief explanation.
    - Ask questions to encourage them to use the new vocabulary and grammar.
    - Keep your responses relatively short and conversational.`;

  const chat = chatModel.startChat({
    history: [
      // The AI's instructions come first
      { role: 'user', parts: [{ text: initialPrompt }] },
      { role: 'model', parts: [{ text: `Great! I've reviewed the lesson on "${lessonContext.title}". Let's practice. Ask me a question or try making a sentence using what you've learned!` }] },
      // Then, we load the user's actual conversation history
      ...history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))
    ]
  });

  // We only need to send the last message from the user
  const lastUserMessage = history[history.length - 1].content;

  try {
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in getTutorChatResponse service:", error);
    throw new Error("Failed to get chat response from AI.");
  }
}

/**
 * Provides corrective feedback on a user's transcribed speech.
 * @param {string} transcript - The text converted from the user's speech.
 * @param {object} lessonContext - The lesson the user is practicing.
 * @returns {Promise<string>} The AI's corrective feedback.
 */
export const getSpeechFeedback = async (transcript, lessonContext) => {
  const prompt = `
    You are an expert language coach providing feedback on a student's speaking practice.
    The student is learning ${lessonContext.language} and has just completed a lesson titled "${lessonContext.title}".
    
    The student's spoken attempt was transcribed as: "${transcript}"

    Your task is to:
    1.  Analyze the transcript for grammatical errors or unnatural phrasing based on the lesson's context.
    2.  If the sentence is perfect, reply with an encouraging message like "Excellent! That's a perfect sentence."
    3.  If the sentence has errors, first provide the **Corrected Version**.
    4.  Then, in a new paragraph, provide a **Simple Explanation** of the correction. Keep the tone friendly and supportive.
  `;

  try {
    const result = await feedbackModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error)    {
    console.error("Error in getSpeechFeedback service:", error);
    throw new Error("Failed to get speech feedback from AI.");
  }
};