const API_URL = 'http://localhost:8001';

export async function askRag(question) {
  console.log(`Sending RAG question to: ${API_URL}/ask`);
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    console.log(`RAG Response Status: ${response.status}`);
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
