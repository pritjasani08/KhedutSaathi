const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getIrrigationPlan(config) {
  try {
    const response = await fetch(`${API_URL}/api/irrigation/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching irrigation plan:', error);
    throw error;
  }
}
