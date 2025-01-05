import { storageService } from './storageService';

export const searchService = {
  // Search through food history
  searchFood: async (query, filters = {}) => {
    try {
      const history = await storageService.getFoodHistory();
      
      return history.filter(item => {
        // Match search query
        const matchesQuery = item.results.some(result => 
          result.name.toLowerCase().includes(query.toLowerCase())
        );

        // Match category filter if present
        const matchesCategory = !filters.category || 
          item.results.some(result => 
            result.category === filters.category
          );

        // Match date filter if present
        const matchesDate = !filters.date ||
          new Date(item.timestamp).toDateString() === filters.date.toDateString();

        return matchesQuery && matchesCategory && matchesDate;
      });
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  // Get food categories
  getCategories: async () => {
    try {
      const history = await storageService.getFoodHistory();
      const categories = new Set();
      
      history.forEach(item => {
        item.results.forEach(result => {
          if (result.category) {
            categories.add(result.category);
          }
        });
      });

      return Array.from(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }
}; 