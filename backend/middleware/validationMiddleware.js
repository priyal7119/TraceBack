/**
 * Input Validation Middleware
 */

const { isValidEmail, isValidPassword, isValidCategory, canonicalizeCategory, VALID_CATEGORIES, sanitizeString } = require('../utils/validators');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || sanitizeString(name).length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  if (!isValidEmail(email)) {
    errors.push('A valid email address is required (e.g. name@campus.ves.ac.in).');
  }

  if (!isValidPassword(password)) {
    errors.push('Password must be at least 6 characters.');
  }

  // Prevent client from escalating their own role to admin
  if (req.body.role && req.body.role !== 'user') {
    delete req.body.role;
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials supplied',
      errors,
    });
  }

  next();
};

const validateReport = (type) => {
  return (req, res, next) => {
    let { title, description, category, date, location } = req.body;
    const errors = [];

    title = sanitizeString(title);
    description = sanitizeString(description);
    location = sanitizeString(location);
    const canonicalCat = canonicalizeCategory(category);

    if (!title || title.length < 3) {
      errors.push('Item title must be at least 3 characters.');
    }

    if (!description || description.length < 5) {
      errors.push('Description must provide at least 5 characters of detail.');
    }

    if (!canonicalCat) {
      errors.push(`Invalid category "${category || ''}". Permitted categories: ${VALID_CATEGORIES.join(', ')}`);
    } else {
      req.body.category = canonicalCat;
    }

    if (!date) {
      errors.push(`Date ${type} is required.`);
    }

    if (!location || location.length < 2) {
      errors.push('Campus location is required.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Report validation failed: ${errors.join('. ')}`,
        errors,
      });
    }

    req.body.title = title;
    req.body.description = description;
    req.body.location = location;

    next();
  };
};

const validateClaim = (req, res, next) => {
  const { itemId, proofDetails } = req.body;
  const errors = [];

  if (!itemId) {
    errors.push('Item ID is required to file a claim.');
  }

  if (!proofDetails || sanitizeString(proofDetails).length < 10) {
    errors.push('Proof details must describe ownership in at least 10 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Claim validation failed',
      errors,
    });
  }

  next();
};

const validateDispute = (req, res, next) => {
  const { itemId, reason } = req.body;
  const errors = [];

  if (!itemId) {
    errors.push('Item ID is required for opening a dispute.');
  }

  if (!reason || sanitizeString(reason).length < 10) {
    errors.push('Reason for dispute must be at least 10 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dispute validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateReport,
  validateClaim,
  validateDispute,
};
