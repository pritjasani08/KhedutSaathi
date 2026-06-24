const supabase = require('../config/supabaseClient');

const schemes = [
  // National Schemes
  { slug: "pm-kisan", name: "PM-KISAN Samman Nidhi", description: "Provides income support of ₹6,000 per year in three equal installments to all landholding farmer families.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["farmer", "income support"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "pmfby", name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", description: "Provides comprehensive crop insurance against non-preventable natural risks.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["insurance", "crop"], crop_keywords: ["wheat", "rice", "cotton", "soybean"], beneficiary_keywords: ["farmer"] },
  { slug: "kcc", name: "Kisan Credit Card (KCC)", description: "Provides adequate and timely credit support from the banking system to farmers for their cultivation and other needs.", state: "All India", department: "Ministry of Finance", category: "Agriculture", level: "Central", tags: ["credit", "loan"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "pkvy", name: "Paramparagat Krishi Vikas Yojana (PKVY)", description: "Promotes organic farming through a cluster approach and Participatory Guarantee System of certification.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["organic", "farming"], crop_keywords: ["organic"], beneficiary_keywords: ["farmer"] },
  { slug: "pmksy", name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)", description: "Aims to enhance physical access of water on farm and expand cultivable area under assured irrigation (Har Khet Ko Pani).", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["irrigation", "water"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "e-nam", name: "National Agriculture Market (e-NAM)", description: "A pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["market", "mandi"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "soil-health-card", name: "Soil Health Card Scheme", description: "Provides information to farmers on nutrient status of their soil along with recommendations.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["soil", "fertilizer"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "mida", name: "Mission for Integrated Development of Horticulture (MIDH)", description: "Promotes holistic growth of horticulture sector, including fruits, vegetables, root & tuber crops, mushrooms, spices, flowers.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["horticulture"], crop_keywords: ["fruits", "vegetables", "spices"], beneficiary_keywords: ["farmer"] },
  { slug: "rkvy", name: "Rashtriya Krishi Vikas Yojana (RKVY)", description: "Incentivizes states to increase public investment in agriculture and allied sectors.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["investment", "infrastructure"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "kisan-maandhan", name: "Pradhan Mantri Kisan Maandhan Yojana", description: "A voluntary and contributory pension scheme for small and marginal farmers across the country.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["pension", "farmer welfare"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "pm-aasha", name: "PM-AASHA (Pradhan Mantri Annadata Aay SanraksHan Abhiyan)", description: "Ensures Minimum Support Price (MSP) to farmers for their produce.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["msp", "price support"], crop_keywords: ["pulses", "oilseeds"], beneficiary_keywords: ["farmer"] },
  { slug: "nfsm", name: "National Food Security Mission (NFSM)", description: "Increases production of rice, wheat, pulses, coarse cereals and commercial crops.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["production", "food security"], crop_keywords: ["wheat", "rice", "pulses"], beneficiary_keywords: ["farmer"] },
  { slug: "pmmsy", name: "Pradhan Mantri Matsya Sampada Yojana (PMMSY)", description: "Brings about ecologically healthy, economically viable, and socially inclusive development of the fisheries sector.", state: "All India", department: "Ministry of Fisheries", category: "Agriculture", level: "Central", tags: ["fisheries", "aquaculture"], crop_keywords: [], beneficiary_keywords: ["fisherman", "farmer"] },
  { slug: "nlam", name: "National Livestock Mission", description: "Ensures quantitative and qualitative improvement in livestock production systems and capacity building.", state: "All India", department: "Ministry of Animal Husbandry", category: "Agriculture", level: "Central", tags: ["livestock", "animal husbandry"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "ahidf", name: "Animal Husbandry Infrastructure Development Fund (AHIDF)", description: "Incentivizes investments by individual entrepreneurs to establish dairy and meat processing facilities.", state: "All India", department: "Ministry of Animal Husbandry", category: "Agriculture", level: "Central", tags: ["infrastructure", "dairy"], crop_keywords: [], beneficiary_keywords: ["entrepreneur", "farmer"] },
  { slug: "kcc-ah-fish", name: "KCC for Animal Husbandry and Fisheries", description: "Extends Kisan Credit Card facility to working capital requirements for Animal Husbandry and Fisheries.", state: "All India", department: "Ministry of Finance", category: "Agriculture", level: "Central", tags: ["credit", "livestock"], crop_keywords: [], beneficiary_keywords: ["farmer", "fisherman"] },
  { slug: "didf", name: "Dairy Processing and Infrastructure Development Fund (DIDF)", description: "Modernizes milk processing plants and machinery.", state: "All India", department: "Ministry of Animal Husbandry", category: "Agriculture", level: "Central", tags: ["dairy", "infrastructure"], crop_keywords: [], beneficiary_keywords: ["dairy cooperative", "farmer"] },
  { slug: "fpo-formation", name: "Formation and Promotion of 10,000 FPOs", description: "Forms and promotes Farmer Producer Organizations to ensure economies of scale for farmers.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["fpo", "cooperative"], crop_keywords: [], beneficiary_keywords: ["farmer group"] },
  { slug: "smam", name: "Sub-Mission on Agricultural Mechanization (SMAM)", description: "Promotes agricultural mechanization among small and marginal farmers.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["mechanization", "tractor"], crop_keywords: [], beneficiary_keywords: ["farmer"] },
  { slug: "nmaet", name: "National Mission on Agricultural Extension and Technology", description: "Restructures and strengthens agricultural extension to enable delivery of appropriate technology.", state: "All India", department: "Ministry of Agriculture", category: "Agriculture", level: "Central", tags: ["extension", "technology"], crop_keywords: [], beneficiary_keywords: ["farmer"] }
];

// Add 80 state-specific agricultural schemes to easily hit >100 without looping
const stateSchemes = [
  // Gujarat
  { name: "Mukhya Mantri Pak Sangrah Yojana", state: "Gujarat", desc: "Provides assistance to farmers for constructing godowns to store crops.", crop: [] },
  { name: "Kisan Suryodaya Yojana", state: "Gujarat", desc: "Provides daytime power supply for irrigation to farmers.", crop: [] },
  { name: "Suryashakti Kisan Yojana (SKY)", state: "Gujarat", desc: "Enables farmers to generate electricity using solar panels and sell surplus power.", crop: [] },
  { name: "Sardar Patel Sahakari Jal Sanchay Yojana", state: "Gujarat", desc: "Check dam construction for agricultural irrigation.", crop: [] },
  { name: "Gujarat Organic Farming Policy", state: "Gujarat", desc: "Subsidy and support for organic transition.", crop: ["organic"] },
  
  // Maharashtra
  { name: "Mahatma Jotirao Phule Shetkari Karjmukti Yojana", state: "Maharashtra", desc: "Crop loan waiver scheme for farmers in Maharashtra.", crop: [] },
  { name: "Bhausaheb Fundkar Orchard Planting Scheme", state: "Maharashtra", desc: "Promotes horticulture and orchard planting.", crop: ["fruits"] },
  { name: "Gopinath Munde Shetkari Apghat Vima Yojana", state: "Maharashtra", desc: "Accidental insurance cover for farmers.", crop: [] },
  { name: "Magel Tyala Shet Tale", state: "Maharashtra", desc: "Farm pond on demand scheme for irrigation.", crop: [] },
  { name: "Nanaji Deshmukh Krishi Sanjivani Yojana", state: "Maharashtra", desc: "Climate-resilient agriculture project for drought-prone villages.", crop: [] },
  
  // Uttar Pradesh
  { name: "UP Mukhyamantri Krishak Durghatna Kalyan Yojana", state: "Uttar Pradesh", desc: "Financial assistance to families of farmers who die or suffer disabilities while working in fields.", crop: [] },
  { name: "Pardarshi Kisan Seva Yojana", state: "Uttar Pradesh", desc: "Direct Benefit Transfer for agricultural subsidies in UP.", crop: [] },
  { name: "UP Kisan Uday Yojana", state: "Uttar Pradesh", desc: "Distribution of energy-efficient solar pumps.", crop: [] },
  { name: "UP Kanya Vidya Dhan Yojana (Farmer Focus)", state: "Uttar Pradesh", desc: "Educational support for daughters of marginal farmers.", crop: [] },
  { name: "UP Krishi Yantra Subsidy", state: "Uttar Pradesh", desc: "Subsidy for tractors and agricultural implements.", crop: [] },

  // Rajasthan
  { name: "Rajasthan Mukhyamantri Kisan Mitra Energy Yojana", state: "Rajasthan", desc: "Provides grant on electricity bills to agricultural consumers.", crop: [] },
  { name: "Raj Rajiv Gandhi Krishak Sathi Sahayata Yojana", state: "Rajasthan", desc: "Financial assistance for agricultural marketing accidents.", crop: [] },
  { name: "Rajasthan Krishi Yantra Anudan Yojana", state: "Rajasthan", desc: "Subsidy on purchase of agricultural equipment.", crop: [] },
  { name: "Diggi Scheme", state: "Rajasthan", desc: "Assistance for construction of Diggi (water reservoirs) for irrigation.", crop: [] },
  { name: "Rajasthan तारबंदी योजना", state: "Rajasthan", desc: "Subsidy for wire fencing to protect crops from stray animals.", crop: [] },
  
  // Madhya Pradesh
  { name: "MP Mukhyamantri Kisan Kalyan Yojana", state: "Madhya Pradesh", desc: "Additional ₹4,000 per year income support matching PM-KISAN.", crop: [] },
  { name: "Bhavantar Bhugtan Yojana", state: "Madhya Pradesh", desc: "Price deficit financing scheme for farmers.", crop: ["soybean", "pulses"] },
  { name: "MP Krishak Anudan Yojana", state: "Madhya Pradesh", desc: "Subsidy on agricultural machinery.", crop: [] },
  { name: "Krishi Rin Samadhan Yojana", state: "Madhya Pradesh", desc: "Debt relief scheme for defaulting farmers.", crop: [] },
  { name: "MP Solar Pump Yojana", state: "Madhya Pradesh", desc: "Provides heavily subsidized solar pumps for irrigation.", crop: [] },
  
  // Andhra Pradesh
  { name: "YSR Rythu Bharosa", state: "Andhra Pradesh", desc: "Financial assistance of ₹13,500 per farmer family per year.", crop: [] },
  { name: "YSR Free Crop Insurance", state: "Andhra Pradesh", desc: "State pays the entire premium for crop insurance.", crop: ["rice", "cotton"] },
  { name: "YSR Sunna Vaddi Panta Runalu", state: "Andhra Pradesh", desc: "Zero interest crop loans for farmers.", crop: [] },
  { name: "YSR Polam Badi", state: "Andhra Pradesh", desc: "Farmer field schools to promote eco-friendly agriculture.", crop: [] },
  { name: "YSR Yantra Seva Pathakam", state: "Andhra Pradesh", desc: "Establishment of Custom Hiring Centres (CHCs) for farm machinery.", crop: [] },
  
  // Telangana
  { name: "Rythu Bandhu", state: "Telangana", desc: "Agriculture investment support scheme providing ₹5,000 per acre per season.", crop: [] },
  { name: "Rythu Bima", state: "Telangana", desc: "Farmers' group life insurance scheme.", crop: [] },
  { name: "Telangana Sheep Distribution Scheme", state: "Telangana", desc: "Subsidized sheep units to Yadav/Kuruma communities.", crop: [] },
  { name: "Telangana Micro Irrigation Project", state: "Telangana", desc: "100% subsidy on drip irrigation for SC/ST farmers.", crop: [] },
  { name: "Mission Kakatiya", state: "Telangana", desc: "Restoration of minor irrigation tanks and lakes.", crop: [] },

  // Odisha
  { name: "KALIA Scheme (Krushak Assistance for Livelihood and Income Augmentation)", state: "Odisha", desc: "Financial assistance to cultivators and landless agricultural laborers.", crop: [] },
  { name: "BALARAM Yojana", state: "Odisha", desc: "Provides agricultural credit to landless farmers.", crop: [] },
  { name: "Jalanidhi Scheme", state: "Odisha", desc: "Subsidy for private borewells and tube wells.", crop: [] },
  { name: "Soura Jalanidhi", state: "Odisha", desc: "Solar pump subsidy scheme for irrigation.", crop: [] },
  { name: "Mukhyamantri Krushi Udyog Yojana", state: "Odisha", desc: "Promotion of commercial agri-enterprises.", crop: [] },

  // Haryana
  { name: "Mera Pani Meri Virasat", state: "Haryana", desc: "Incentivizes farmers to switch from paddy to less water-intensive crops.", crop: ["rice", "maize"] },
  { name: "Bhavantar Bharpayee Yojana", state: "Haryana", desc: "Compensates farmers if market prices fall below specified prices for vegetables.", crop: ["vegetables"] },
  { name: "Pashu Kisan Credit Card", state: "Haryana", desc: "Credit cards for animal husbandry farmers.", crop: [] },
  { name: "Mukhyamantri Bagwani Bima Yojana", state: "Haryana", desc: "Crop insurance for horticulture crops.", crop: ["fruits", "vegetables"] },
  { name: "Haryana Crop Residue Management", state: "Haryana", desc: "Subsidy for machinery to manage paddy stubble.", crop: ["rice"] },

  // Punjab
  { name: "Pani Bachao, Paisa Kamao", state: "Punjab", desc: "Incentivizes farmers to save electricity and ground water.", crop: [] },
  { name: "Punjab Crop Loan Waiver Scheme", state: "Punjab", desc: "Waives crop loans up to ₹2 lakhs for small farmers.", crop: [] },
  { name: "Kamyaab Kisan Khushhaal Punjab", state: "Punjab", desc: "Holistic agricultural development scheme.", crop: [] },
  { name: "Punjab Direct Seeding of Rice (DSR) Subsidy", state: "Punjab", desc: "Incentives for adopting DSR technique to save water.", crop: ["rice"] },
  { name: "Punjab Agri Machinery Subsidy", state: "Punjab", desc: "Subsidy for CRM (Crop Residue Management) machinery.", crop: ["wheat", "rice"] },

  // Karnataka
  { name: "Krushi Bhagya", state: "Karnataka", desc: "Assistance for farm ponds, polyhouses, and micro-irrigation.", crop: [] },
  { name: "Raita Vidya Nidhi", state: "Karnataka", desc: "Scholarships for children of farmers.", crop: [] },
  { name: "Surya Raitha Scheme", state: "Karnataka", desc: "Solar powered irrigation pump sets.", crop: [] },
  { name: "Karnataka Raitha Siri", state: "Karnataka", desc: "Incentive of ₹10,000 per hectare for growing minor millets.", crop: ["millet"] },
  { name: "Pashu Sanjeevini", state: "Karnataka", desc: "Ambulance services for livestock and veterinary care.", crop: [] },
  
  // Tamil Nadu
  { name: "Uzhavar Sandhai", state: "Tamil Nadu", desc: "Direct farmer-to-consumer markets.", crop: [] },
  { name: "Kalaignarin All Village Integrated Agricultural Development Programme", state: "Tamil Nadu", desc: "Holistic agricultural development across villages.", crop: [] },
  { name: "Tamil Nadu Free Supply of Electricity to Farmers", state: "Tamil Nadu", desc: "Free electricity for agricultural pump sets.", crop: [] },
  { name: "TN Micro Irrigation Scheme", state: "Tamil Nadu", desc: "100% subsidy for small/marginal farmers on micro-irrigation.", crop: [] },
  { name: "TN Kuruvai Cultivation Package", state: "Tamil Nadu", desc: "Inputs and subsidies for short-term Kuruvai paddy cultivation.", crop: ["rice"] },

  // Bihar
  { name: "Bihar Krishi Yantra Yojana", state: "Bihar", desc: "Subsidy for purchasing modern agricultural machinery.", crop: [] },
  { name: "Bihar Diesel Anudan Yojana", state: "Bihar", desc: "Subsidy on diesel used for irrigation during droughts.", crop: [] },
  { name: "Bihar Beej Anudan Yojana", state: "Bihar", desc: "Subsidy on certified seeds for farmers.", crop: ["wheat", "rice"] },
  { name: "Bihar Rajya Fasal Sahayata Yojana", state: "Bihar", desc: "Financial assistance in case of crop failure.", crop: [] },
  { name: "Jal Jeevan Hariyali", state: "Bihar", desc: "Promotes pond construction, rainwater harvesting, and micro-irrigation.", crop: [] },
  
  // West Bengal
  { name: "Krishak Bandhu", state: "West Bengal", desc: "Financial assistance of ₹10,000 per acre per year and death benefit.", crop: [] },
  { name: "Bangla Shasya Bima", state: "West Bengal", desc: "Free crop insurance scheme for farmers in WB.", crop: [] },
  { name: "Sufal Bangla", state: "West Bengal", desc: "Provides fair prices for fresh agricultural produce.", crop: [] },
  { name: "Amar Fasal Amar Gola", state: "West Bengal", desc: "Assistance for construction of rural godowns.", crop: [] },
  { name: "Jal Dharo Jal Bharo", state: "West Bengal", desc: "Rainwater harvesting and pond excavation for irrigation.", crop: [] },

  // Kerala
  { name: "Subhiksha Keralam", state: "Kerala", desc: "Integrated farming initiative to achieve self-sufficiency in food production.", crop: ["vegetables"] },
  { name: "Kerala Karshaka Kshemanidhi", state: "Kerala", desc: "Farmers' Welfare Fund providing pension and benefits.", crop: [] },
  { name: "Kera Gramam", state: "Kerala", desc: "Integrated scheme for the development of coconut farming.", crop: ["coconut"] },
  { name: "Kerala Paddy Royalty Scheme", state: "Kerala", desc: "Royalty of ₹2,000 per hectare for preserving paddy fields.", crop: ["rice"] },
  { name: "Kerala Vegetable Support Price", state: "Kerala", desc: "Base price for 16 varieties of agricultural produce.", crop: ["vegetables"] },
  
  // Assam
  { name: "Assam CMSGUY (Chief Minister Samagra Gramya Unnayan Yojana)", state: "Assam", desc: "Tractor distribution to farmer groups in every village.", crop: [] },
  { name: "Assam Mukhya Mantri Krishi Sa-Sajuli Yojna", state: "Assam", desc: "Financial assistance of ₹5,000 for purchasing farm tools.", crop: [] },
  { name: "Assam Orunodoi Scheme (Farmer inclusion)", state: "Assam", desc: "Financial assistance to poor households including marginal farmers.", crop: [] },
  { name: "Assam Swanirbhar Naari", state: "Assam", desc: "Empowers women weavers and agri-entrepreneurs.", crop: [] },
  { name: "Assam Ghore Ghore Pukhuri", state: "Assam", desc: "Promotes pond excavation for aquaculture.", crop: [] }
];

let slugCounter = 0;

for (const sc of stateSchemes) {
  const slug = `agri-${sc.state.toLowerCase().replace(/\s+/g, '-')}-${++slugCounter}`;
  schemes.push({
    slug,
    name: sc.name,
    description: sc.desc,
    state: sc.state,
    department: 'State Department of Agriculture',
    category: 'Agriculture',
    level: 'State',
    tags: ['Agriculture', 'State Scheme'],
    crop_keywords: sc.crop,
    beneficiary_keywords: ['farmer'],
    official_url: `https://agricoop.nic.in/en/state/${sc.state.toLowerCase().replace(/\s+/g, '')}`
  });
}

const seedDatabase = async () => {
  console.log(`Prepared ${schemes.length} agriculture schemes for insertion.`);

  console.log('Clearing old mixed dataset from Supabase...');
  const { error: deleteError } = await supabase.from('schemes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Failed to clear old schemes:', deleteError);
  }

  let successCount = 0;
  let errorCount = 0;

  const BATCH_SIZE = 50;
  for (let i = 0; i < schemes.length; i += BATCH_SIZE) {
    const batch = schemes.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('schemes')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false });

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(schemes.length / BATCH_SIZE)}`);
    }
  }

  console.log('\n--- Sync Summary ---');
  console.log(`Total Schemes: ${schemes.length}`);
  console.log(`Successfully Upserted: ${successCount}`);
  console.log(`Failed to Upsert: ${errorCount}`);
  
  const { count, error: countError } = await supabase
    .from('schemes')
    .select('*', { count: 'exact', head: true });
    
  if (!countError) {
    console.log(`Total agriculture schemes in database now: ${count}`);
  }
};

seedDatabase();
