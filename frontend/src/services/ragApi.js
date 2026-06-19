const API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000';

export const askRagApi = async (question) => {
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      return data.answer;
    } else {
      throw new Error(data.error || 'Failed to get an answer from the RAG API.');
    }
  } catch (error) {
    console.error('Error in askRagApi:', error);
    throw error;
  }
};
