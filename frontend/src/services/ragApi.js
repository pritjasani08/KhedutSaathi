const API_URL = 'http://localhost:8001';

export async function askRag(question) {
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success) {
      return data.answer;
    } else {
      throw new Error(data.error || 'Failed to get an answer from the RAG API.');
    }
  } catch (error) {
    console.error('CRITICAL Error in askRag. Could not connect to the RAG server!', error);
    throw error;
  }
}
