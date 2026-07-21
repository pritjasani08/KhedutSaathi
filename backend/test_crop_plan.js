const axios = require('axios');

async function testCropPlan() {
  try {
    const response = await axios.post('http://localhost:5000/api/crop-planner/plan', {
      state: 'Gujarat',
      district: 'Ahmedabad',
      soilType: 'Loamy Soil',
      season: 'Kharif',
      farmArea: 5,
      waterAvailability: 'Medium',
      preferredDuration: 'Medium'
    });

    console.log(JSON.stringify({
      knowledgeMetadata: response.data.knowledgeMetadata,
      firstRecAiExplanation: response.data.recommendations[0]?.aiExplanation,
      firstRecKnowledgeCount: response.data.recommendations[0]?.knowledge?.length || 0,
      firstRecKnowledgeTitle: response.data.recommendations[0]?.knowledge?.[0]?.title
    }, null, 2));

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

testCropPlan();
