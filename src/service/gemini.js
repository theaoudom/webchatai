const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL;

export const sendMessage = async (history) => {
  try {
    const formattedHistory = history.map((msg) => ({
      role: msg.sender,
      parts: [{ text: msg.text }],
    }));

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': `${API_KEY}`,
      },
      body: JSON.stringify({
        contents: formattedHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error sending message:', error);
    return 'Error: Unable to get a response from the model.';
  }
};
