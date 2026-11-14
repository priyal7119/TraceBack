/**
 * Input validation helpers
 */

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  // Basic RFC 5322 regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  // Minimum 6 characters for demo usability while requiring some complexity
  return password.length >= 6;
};

const VALID_CATEGORIES = [
  'Electronics',
  'Keys & Cards',
  'ID & Documents',
  'Documents',
  'Bags & Wallets',
  'Clothing & Lab Wear',
  'Clothing',
  'Stationery & Books',
  'Bottles & Flasks',
  'Eyewear & Accessories',
  'Jewelry & Watches',
  'Sports & Fitness',
  'Other'
];

const CATEGORY_ALIASES = {
  'bags & luggage': 'Bags & Wallets',
  'luggage': 'Bags & Wallets',
  'bags': 'Bags & Wallets',
  'wallets': 'Bags & Wallets',
  'jewelry & valuables': 'Jewelry & Watches',
  'jewelry': 'Jewelry & Watches',
  'watches': 'Jewelry & Watches',
  'keys & ids': 'Keys & Cards',
  'keys': 'Keys & Cards',
  'cards': 'Keys & Cards',
  'ids': 'ID & Documents',
  'id': 'ID & Documents',
  'books': 'Stationery & Books',
  'stationery': 'Stationery & Books',
  'bottles': 'Bottles & Flasks',
  'accessories': 'Eyewear & Accessories',
  'eyewear': 'Eyewear & Accessories',
  'sports': 'Sports & Fitness',
};

const canonicalizeCategory = (cat) => {
  if (!cat || typeof cat !== 'string') return null;
  const trimmed = cat.trim();
  const lower = trimmed.toLowerCase();

  const exactMatch = VALID_CATEGORIES.find(c => c.toLowerCase() === lower);
  if (exactMatch) return exactMatch;

  if (CATEGORY_ALIASES[lower]) {
    return CATEGORY_ALIASES[lower];
  }

  return null;
};

const isValidCategory = (category) => {
  return Boolean(canonicalizeCategory(category));
};

const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};

const VALID_STATUSES = [
  'active',
  'matched',
  'claimed',
  'under_review',
  'resolved',
  'archived',
  'cancelled'
];

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidCategory,
  canonicalizeCategory,
  CATEGORY_ALIASES,
  VALID_CATEGORIES,
  VALID_STATUSES,
  sanitizeString,
};
