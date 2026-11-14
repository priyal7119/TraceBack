/**
 * TraceBack Matching Engine Configuration
 * Weighted scoring approach for comparing Lost and Found items.
 * Configurable weights: Total = 100%
 */

module.exports = {
  // Configurable weights (must sum to 1.0 or 100)
  weights: {
    imageLabels: parseFloat(process.env.WEIGHT_IMAGE || '0.40'),     // 40% Image labels / visual similarity
    category: parseFloat(process.env.WEIGHT_CATEGORY || '0.25'),       // 25% Item category match
    location: parseFloat(process.env.WEIGHT_LOCATION || '0.20'),       // 20% Campus location proximity/match
    date: parseFloat(process.env.WEIGHT_DATE || '0.15'),               // 15% Date proximity (lost vs found)
  },

  // Thresholds for match generation
  thresholds: {
    minimumMatchScore: parseInt(process.env.MATCH_THRESHOLD || '70', 10), // Initial proposed threshold: 70%
    highConfidenceThreshold: parseInt(process.env.MATCH_HIGH_THRESHOLD || '85', 10), // >= 85% is High Confidence
    mediumConfidenceThreshold: parseInt(process.env.MATCH_MEDIUM_THRESHOLD || '70', 10), // 70% - 84% is Medium Confidence
  },

  // Maximum allowed days difference between lost date and found date for similarity calculation
  maxDateDifferenceDays: 60,

  // Campus Known Locations map (HAMC Chembur) with relative distance clusters
  hamcLocations: [
    'Main Gate Security Cabin',
    'Central Library Custody Desk',
    'Central Library - 2nd Floor Reading Room',
    'Auditorium Foyer',
    'Auditorium',
    'Campus Canteen',
    'Central Quadrangle',
    'Lab 402 - Advanced Computing Lab',
    'Lab Block - Ground Floor Corridor',
    'Sports Turf / Gymkhana Ground',
    'Pharmacy Building - Organic Chemistry Lab',
    'Administrative Office - Counter 3',
    'Main Entrance Walkway'
  ]
};
