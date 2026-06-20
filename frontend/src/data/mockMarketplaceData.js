export const categories = [
  { id: 'seeds', name: 'Seeds', icon: 'Sprout', count: 124 },
  { id: 'fertilizers', name: 'Fertilizers', icon: 'FlaskConical', count: 85 },
  { id: 'pesticides', name: 'Pesticides', icon: 'Bug', count: 62 },
  { id: 'farm-equipment', name: 'Farm Equipment', icon: 'Tractor', count: 45 },
  { id: 'irrigation', name: 'Irrigation Systems', icon: 'Droplets', count: 38 },
  { id: 'organic', name: 'Organic Products', icon: 'Leaf', count: 156 },
  { id: 'tools', name: 'Tools & Machinery', icon: 'Wrench', count: 92 },
  { id: 'animal-feed', name: 'Animal Feed', icon: 'Wheat', count: 73 },
];

export const products = [
  {
    id: 'p1',
    name: 'Premium Hybrid Tomato Seeds (Arka Rakshak)',
    brand: 'Kisan Seeds Co.',
    shortDescription: 'High yield, disease-resistant tomato seeds suitable for varied climates.',
    description: 'Arka Rakshak is a high-yielding, triple disease-resistant tomato F1 hybrid. It produces firm, deep red fruits weighing 90-100g each. Ideal for long-distance transport and processing.',
    category: 'Seeds',
    rating: 4.8,
    reviewsCount: 342,
    currentPrice: 450,
    originalPrice: 500,
    discountPercentage: 10,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'Ramesh Patel',
      farm: 'Patel Agro Seeds',
      location: 'Ahmedabad, Gujarat',
      verified: true
    },
    specifications: {
      'Weight': '10g',
      'Germination Rate': '90%+',
      'Season': 'Kharif, Rabi',
      'Crop Duration': '140 Days'
    }
  },
  {
    id: 'p2',
    name: 'Organic NPK Bio-Fertilizer (Liquid)',
    brand: 'GreenGrow',
    shortDescription: '100% organic liquid fertilizer for enhanced crop growth and soil health.',
    description: 'A complete nutritional package containing nitrogen-fixing, phosphorus-solubilizing, and potassium-mobilizing bacteria. Suitable for all crops, vegetables, and fruits.',
    category: 'Organic Products',
    rating: 4.5,
    reviewsCount: 128,
    currentPrice: 850,
    originalPrice: 1000,
    discountPercentage: 15,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1628532454687-172152b1bcfb?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'AgriOrganics Ltd',
      farm: 'GreenGrow Industries',
      location: 'Pune, Maharashtra',
      verified: true
    },
    specifications: {
      'Volume': '1 Litre',
      'Type': 'Liquid Bio-Fertilizer',
      'Shelf Life': '1 Year',
      'Dosage': '5ml per litre of water'
    }
  },
  {
    id: 'p3',
    name: 'Heavy Duty Hand Trowel',
    brand: 'AgroTools',
    shortDescription: 'Ergonomic hand trowel with rust-resistant carbon steel blade.',
    description: 'Perfect for digging, transplanting, and turning soil. Features a comfortable, non-slip grip and a durable carbon steel blade designed to withstand heavy farm use.',
    category: 'Tools & Machinery',
    rating: 4.2,
    reviewsCount: 85,
    currentPrice: 299,
    originalPrice: 350,
    discountPercentage: 14,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1416879598555-22b270a64931?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'Farm Hardware Hub',
      farm: 'Hardware Impex',
      location: 'Ludhiana, Punjab',
      verified: true
    },
    specifications: {
      'Material': 'Carbon Steel',
      'Handle': 'Ergonomic Rubber',
      'Weight': '250g',
      'Warranty': '6 Months'
    }
  },
  {
    id: 'p4',
    name: 'Drip Irrigation Starter Kit (100m)',
    brand: 'AquaDrop',
    shortDescription: 'Complete drip irrigation system for small to medium-sized vegetable plots.',
    description: 'Save up to 70% water with this easy-to-install drip irrigation kit. Includes 100m of lateral pipe, drippers, connectors, and a screen filter. Ideal for row crops and orchards.',
    category: 'Irrigation Systems',
    rating: 4.9,
    reviewsCount: 512,
    currentPrice: 2450,
    originalPrice: 3000,
    discountPercentage: 18,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'WaterTech Solutions',
      farm: 'AquaDrop Pipes',
      location: 'Jalgaon, Maharashtra',
      verified: true
    },
    specifications: {
      'Length': '100 Meters',
      'Drip Spacing': '40 cm',
      'Discharge Rate': '4 LPH',
      'Material': 'UV Stabilized LLDPE'
    }
  },
  {
    id: 'p5',
    name: 'Neem Oil Insecticide (10000 PPM)',
    brand: 'Prakriti',
    shortDescription: 'Natural, cold-pressed neem oil for broad-spectrum pest control.',
    description: '100% natural, cold-pressed neem extract with high Azadirachtin content (10000 PPM). Effectively controls aphids, whiteflies, mites, and caterpillars without harming beneficial insects.',
    category: 'Pesticides',
    rating: 4.6,
    reviewsCount: 210,
    currentPrice: 550,
    originalPrice: 650,
    discountPercentage: 15,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1615485906233-8756c22119c6?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'EcoSave Pest Control',
      farm: 'Prakriti Naturals',
      location: 'Indore, Madhya Pradesh',
      verified: true
    },
    specifications: {
      'Volume': '500ml',
      'Active Ingredient': 'Azadirachtin (10000 PPM)',
      'Type': 'Organic Insecticide',
      'Application': 'Foliar Spray'
    }
  },
  {
    id: 'p6',
    name: 'Premium Cattle Feed Pellets',
    brand: 'NutriMilking',
    shortDescription: 'High-protein cattle feed for improved milk yield and animal health.',
    description: 'Balanced diet pellets fortified with bypass protein, vitamins, and essential minerals. Designed specifically for high-yielding dairy cows and buffaloes to maximize milk production.',
    category: 'Animal Feed',
    rating: 4.7,
    reviewsCount: 890,
    currentPrice: 1200,
    originalPrice: 1250,
    discountPercentage: 4,
    stock: 500,
    imageUrl: 'https://images.unsplash.com/photo-1594496285848-1dbec91f61fb?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'Suresh Yadav',
      farm: 'Yadav Dairy Feeds',
      location: 'Karnal, Haryana',
      verified: true
    },
    specifications: {
      'Weight': '50 Kg',
      'Crude Protein': '22%',
      'Fat': '4%',
      'Target Animal': 'Dairy Cattle'
    }
  },
  {
    id: 'p7',
    name: 'Mini Power Tiller (7 HP)',
    brand: 'KisanKraft',
    shortDescription: 'Compact petrol-driven power tiller for inter-cultivation and weeding.',
    description: 'A powerful and versatile 7 HP petrol engine power tiller. Perfect for de-weeding, soil preparation, and inter-cultivation in horticulture and plantation crops.',
    category: 'Farm Equipment',
    rating: 4.4,
    reviewsCount: 45,
    currentPrice: 45000,
    originalPrice: 52000,
    discountPercentage: 13,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1592424001948-438997a47de0?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'AgriMachinery Direct',
      farm: 'KisanKraft Dealers',
      location: 'Bangalore, Karnataka',
      verified: true
    },
    specifications: {
      'Engine Power': '7 HP',
      'Fuel Type': 'Petrol',
      'Tilling Depth': '5-6 inches',
      'Warranty': '1 Year'
    }
  },
  {
    id: 'p8',
    name: 'Urea Fertilizer (46% Nitrogen)',
    brand: 'IFFCO',
    shortDescription: 'High-quality agricultural grade urea for vigorous plant growth.',
    description: 'Standard agricultural grade Urea providing 46% Nitrogen. Essential for promoting rapid vegetative growth and deep green color in crops.',
    category: 'Fertilizers',
    rating: 4.8,
    reviewsCount: 1250,
    currentPrice: 266,
    originalPrice: 266,
    discountPercentage: 0,
    stock: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1588612140402-997db70cd02e?auto=format&fit=crop&q=80&w=800',
    seller: {
      name: 'Govt. Subsidized Store',
      farm: 'IFFCO eBazar',
      location: 'Pan India',
      verified: true
    },
    specifications: {
      'Weight': '45 Kg',
      'Nitrogen Content': '46%',
      'Type': 'Granular',
      'Application': 'Basal / Top Dressing'
    }
  }
];

export const farmerSellers = [
  {
    id: 'f1',
    name: 'Ramesh Patel',
    farmName: 'Patel Agro Seeds',
    location: 'Ahmedabad, Gujarat',
    productsCount: 15,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&q=80&w=200',
    verified: true
  },
  {
    id: 'f2',
    name: 'Suresh Yadav',
    farmName: 'Yadav Dairy Feeds',
    location: 'Karnal, Haryana',
    productsCount: 8,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    verified: true
  },
  {
    id: 'f3',
    name: 'Anita Desai',
    farmName: 'Desai Organic Farms',
    location: 'Surat, Gujarat',
    productsCount: 24,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    verified: true
  }
];
