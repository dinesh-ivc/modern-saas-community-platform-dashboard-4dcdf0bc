import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long'
);

/**
 * Generate a JWT token
 * @param {Object} payload - User data to encode in token
 * @returns {Promise<string>} JWT token
 */
export async function generateToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
 */
export async function verifyAuth(token) {
  try {
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null
 */
export function extractToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    return token;
  } catch (error) {
    console.error('Error extracting token:', error);
    return null;
  }
}