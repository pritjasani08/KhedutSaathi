const fs = require('fs');
const path = require('path');

const checkEligibility = (req, res) => {
  try {
    const { 
      state = 'All India', 
      age = 30, 
      gender = 'Male', 
      landSize = 1.0, 
      farmerCategory = 'Small & Marginal', 
      primaryCrop = 'Wheat', 
      irrigationType = 'Tube Well' 
    } = req.body;

    const filePath = path.join(__dirname, '../data/schemes.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const allSchemes = JSON.parse(fileData);

    let totalPotentialBenefit = 0;
    const eligibleSchemes = [];

    for (const scheme of allSchemes) {
      if (!scheme.criteria) continue;
      const c = scheme.criteria;
      let isEligible = true;
      let reasons = [];

      // State check
      if (c.state && !c.state.includes('All India') && !c.state.includes(state)) {
        isEligible = false;
      } else {
        reasons.push(`Available in your state (${state})`);
      }

      // Age check
      if (c.minAge !== undefined && age < c.minAge) isEligible = false;
      if (c.maxAge !== undefined && age > c.maxAge) isEligible = false;

      // Gender check
      if (c.gender && !c.gender.includes('All') && !c.gender.includes(gender)) {
        isEligible = false;
      }

      // Land Size check
      if (c.minLandSize !== undefined && landSize < c.minLandSize) isEligible = false;
      if (c.maxLandSize !== undefined && landSize > c.maxLandSize) isEligible = false;
      
      if (isEligible && (c.maxLandSize !== undefined || c.minLandSize !== undefined)) {
        reasons.push(`Your land size (${landSize} ha) qualifies`);
      }

      // Farmer Category check
      if (c.farmerCategory && !c.farmerCategory.includes('All') && !c.farmerCategory.includes(farmerCategory)) {
        isEligible = false;
      }

      // Crops check
      if (c.eligibleCrops && !c.eligibleCrops.includes('All') && !c.eligibleCrops.includes(primaryCrop)) {
        isEligible = false;
      }

      // Irrigation check
      if (c.eligibleIrrigation && !c.eligibleIrrigation.includes('All') && !c.eligibleIrrigation.includes(irrigationType)) {
        isEligible = false;
      }

      if (isEligible) {
        totalPotentialBenefit += (c.estimatedBenefit || 0);
        scheme.matchReason = reasons.join(', ');
        // Remove criteria from output to save bandwidth
        delete scheme.criteria;
        eligibleSchemes.push(scheme);
      }
    }

    res.status(200).json({ 
      success: true, 
      data: eligibleSchemes,
      totalBenefit: totalPotentialBenefit
    });
  } catch (error) {
    console.error('Error in checkEligibility:', error);
    res.status(500).json({ success: false, message: 'Failed to process scheme eligibility.' });
  }
};

module.exports = {
  checkEligibility
};
