import Share from 'react-native-share';
import { Platform } from 'react-native';

export const sharingService = {
  shareFood: async (foodData) => {
    try {
      const { imageUri, results } = foodData;
      
      const message = `Check out this ${results[0].name} I found using FoodAI!\n\n` +
        `Nutrition Info:\n` +
        `Calories: ${results[0].nutrition?.calories || 'N/A'}\n` +
        `Protein: ${results[0].nutrition?.protein || 'N/A'}g\n` +
        `Carbs: ${results[0].nutrition?.carbs || 'N/A'}g\n` +
        `Fat: ${results[0].nutrition?.fat || 'N/A'}g`;

      await Share.open({
        title: 'Share Food',
        message,
        url: Platform.OS === 'ios' ? imageUri : `file://${imageUri}`,
      });
    } catch (error) {
      console.error('Sharing error:', error);
      throw error;
    }
  },

  shareProgress: async (stats) => {
    try {
      const message = `My FoodAI Progress:\n\n` +
        `Foods Tracked: ${stats.totalFoods}\n` +
        `Average Calories: ${stats.avgCalories}\n` +
        `Most Common: ${stats.mostCommon}\n`;

      await Share.open({
        title: 'Share Progress',
        message,
      });
    } catch (error) {
      console.error('Sharing error:', error);
      throw error;
    }
  }
}; 