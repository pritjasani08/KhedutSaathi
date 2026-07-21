const axios = require('axios');

async function testRAG() {
  try {
    const response = await axios.post('http://localhost:5000/api/irrigation/plan', {
      crop: 'Cotton',
      soilType: 'Loamy',
      farmArea: 5,
      state: 'Gujarat',
      district: 'Rajkot',
      lat: 22.3,
      lon: 70.8
    });

    console.log(JSON.stringify({
      knowledgeMetadata: response.data.knowledgeMetadata,
      firstRecAiExplanation: response.data.recommendations[0]?.aiExplanation,
      firstRecActionableInsights: response.data.recommendations[0]?.actionableInsights
    }, null, 2));

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

testRAG();
