/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Minimum 8 characters
  return password.length >= 8;
}

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} { valid: boolean, missingFields: string[] }
 */
export function validateRequiredFields(data, requiredFields) {
  const missingFields = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .trim();
}

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid, false otherwise
 */
export function validateStringLength(str, min, max) {
  if (!str || typeof str !== 'string') {
    return false;
  }

  const length = str.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID, false otherwise
 */
export function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate role
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid role, false otherwise
 */
export function validateRole(role) {
  const validRoles = ['member', 'moderator', 'admin'];
  return validRoles.includes(role);
}