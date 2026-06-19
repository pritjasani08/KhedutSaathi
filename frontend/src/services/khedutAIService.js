/**
 * Khedut AI Service
 * Architecture ready for future backend API integration.
 */

export const askKhedutAI = async (message) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Placeholder responses based on keywords or default
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('disease') || lowerMsg.includes('diagnose')) {
    return "To help diagnose the disease, please upload a clear photo of the affected leaves. Common issues at this time of year include leaf blight and aphids.";
  } else if (lowerMsg.includes('price') || lowerMsg.includes('mandi')) {
    return "Market prices are fluctuating. Today, wheat is trading at ₹2,150/quintal in Rajkot Mandi. Would you like to see trends for other districts?";
  } else if (lowerMsg.includes('weather') || lowerMsg.includes('rain')) {
    return "The forecast predicts scattered showers over the next 48 hours. It's advisable to delay pesticide spraying until the weather clears.";
  } else if (lowerMsg.includes('fertilizer') || lowerMsg.includes('crop')) {
    return "For maximizing yield, applying NPK 19:19:19 during the vegetative stage is highly recommended. Ensure your soil moisture is adequate before application.";
  }
  
  return "Thank you for your question! I'm analyzing your query and will provide you with the best farming advice. This is a demo response — the full AI backend will provide real-time intelligent answers.";
};
