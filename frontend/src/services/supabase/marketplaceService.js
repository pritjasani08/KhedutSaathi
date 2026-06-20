import { supabase } from './client';

/**
 * Fetches products from the Supabase 'products' table.
 * Applies optional filters for search query, category, price range, and minimum rating.
 * 
 * @param {Object} filters
 * @param {string} filters.searchQuery - Text to search in product names
 * @param {string} filters.category - Category to filter by
 * @param {number[]} filters.priceRange - Array [minPrice, maxPrice]
 * @param {number} filters.minRating - Minimum rating filter
 * @returns {Promise<Array>} Array of product objects
 */
export const getProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select('*');

    // Filter by Category
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    // Filter by Search Query
    if (filters.searchQuery) {
      query = query.ilike('name', `%${filters.searchQuery}%`);
    }

    // Filter by Price Range
    if (filters.priceRange && filters.priceRange.length === 2) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
    }

    // Filter by Minimum Rating
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    // Sort by latest by default
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    throw error;
  }
};
