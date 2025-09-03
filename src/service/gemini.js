const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL;

let conversationHistory = [];

export const startNewChat = () => {
  conversationHistory = [];
};

export const sendMessage = async (newMessage, signal) => {
  try {
    conversationHistory.push({
      role: 'user',
      parts: [{ text: newMessage }],
    });

    const systemInstruction = {
      parts: [
        {
          text: 'You are DomAi, a helpful and and friendly AI assistant. Only when asked about your identity or the model you are based on, please state that you are Dom 1.0 pro that train by DomAI Technologies.',
        },
      ],
    };

    const response = await fetch(`${API_URL}`, {
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
