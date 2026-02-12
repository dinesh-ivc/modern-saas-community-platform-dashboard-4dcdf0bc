import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase client for server-side operations
 * @returns {Object} Supabase client
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Execute a database query with error handling
 * @param {Function} queryFn - Function that performs the database query
 * @returns {Promise<Object>} { data, error }
 */
export async function executeQuery(queryFn) {
  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    return { data: null, error };
  }
}

/**
 * Get paginated results
 * @param {string} table - Table name
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} { data, count, error }
 */
export async function getPaginatedResults(table, options = {}) {
  const {
    page = 1,
    limit = 10,
    orderBy = 'created_at',
    ascending = false,
    filters = {},
  } = options;

  try {
    const supabase = getSupabaseClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending })
      .range(from, to);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      error: null,
    };
  } catch (error) {
    console.error('Pagination error:', error);
    return {
      data: [],
      count: 0,
      page,
      limit,
      totalPages: 0,
      error,
    };
  }
}

/**
 * Check if record exists
 * @param {string} table - Table name
 * @param {string} column - Column name
 * @param {any} value - Value to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
export async function recordExists(table, column, value) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq(column, value)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Record exists check error:', error);
    return false;
  }
}

/**
 * Format database error message
 * @param {Error} error - Database error
 * @returns {string} User-friendly error message
 */
export function formatDatabaseError(error) {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle common Postgres error codes
  if (error.code === '23505') {
    return 'A record with this value already exists';
  }

  if (error.code === '23503') {
    return 'Referenced record does not exist';
  }

  if (error.code === '23502') {
    return 'Required field is missing';
  }

  return error.message || 'Database operation failed';
}