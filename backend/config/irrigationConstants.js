const CROP_STAGES = {
  Cotton: [
    { name: 'Germination', durationDays: 15, kc: 0.35 },
    { name: 'Vegetative', durationDays: 45, kc: 0.75 },
    { name: 'Squaring', durationDays: 30, kc: 1.15 },
    { name: 'Flowering', durationDays: 40, kc: 1.20 },
    { name: 'Boll Formation', durationDays: 30, kc: 0.75 },
    { name: 'Maturity', durationDays: 20, kc: 0.50 }
  ],
  Wheat: [
    { name: 'Germination', durationDays: 15, kc: 0.30 },
    { name: 'Tillering', durationDays: 30, kc: 0.75 },
    { name: 'Jointing & Booting', durationDays: 30, kc: 1.15 },
    { name: 'Heading & Flowering', durationDays: 20, kc: 1.15 },
    { name: 'Grain Filling', durationDays: 30, kc: 0.75 },
    { name: 'Maturity', durationDays: 15, kc: 0.25 }
  ],
  Paddy: [
    { name: 'Nursery', durationDays: 20, kc: 1.05 },
    { name: 'Transplanting', durationDays: 15, kc: 1.05 },
    { name: 'Tillering', durationDays: 35, kc: 1.20 },
    { name: 'Panicle Initiation', durationDays: 20, kc: 1.20 },
    { name: 'Flowering', durationDays: 15, kc: 1.10 },
    { name: 'Maturity', durationDays: 20, kc: 0.90 }
  ]
};

const DEFAULT_CROP_STAGES = [
  { name: 'Initial', durationDays: 20, kc: 0.4 },
  { name: 'Development', durationDays: 40, kc: 0.8 },
  { name: 'Mid-Season', durationDays: 40, kc: 1.15 },
  { name: 'Late-Season', durationDays: 20, kc: 0.5 }
];

const METHOD_EFFICIENCIES = {
  Drip: 0.90,
  Sprinkler: 0.75,
  Flood: 0.50,
  Default: 0.60
};

// Base seasonal water requirements in liters per acre for a reference efficiency (100%)
const BASE_WATER_REQUIREMENT_LITERS_PER_ACRE = {
  Cotton: 2500000,
  Wheat: 1800000,
  Paddy: 5000000,
  Default: 2000000
};

const SOIL_RETENTION_FACTORS = {
  Clay: 1.2,
  Loamy: 1.0,
  Sandy: 0.8,
  Default: 1.0
};

module.exports = {
  CROP_STAGES,
  DEFAULT_CROP_STAGES,
  METHOD_EFFICIENCIES,
  BASE_WATER_REQUIREMENT_LITERS_PER_ACRE,
  SOIL_RETENTION_FACTORS
};
