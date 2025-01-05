import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { storageService } from './storageService';

export const exportService = {
  exportToCSV: async () => {
    try {
      const history = await storageService.getFoodHistory();
      
      // Create CSV content
      let csvContent = 'Date,Food,Category,Calories,Protein,Carbs,Fat\n';
      
      history.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString();
        item.results.forEach(result => {
          csvContent += `${date},${result.name},${result.category},${result.nutrition?.calories || ''},${result.nutrition?.protein || ''},${result.nutrition?.carbs || ''},${result.nutrition?.fat || ''}\n`;
        });
      });

      // Save to file
      const path = `${RNFS.CacheDirectoryPath}/food_history.csv`;
      await RNFS.writeFile(path, csvContent, 'utf8');
      
      return path;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  shareExport: async () => {
    try {
      const filePath = await exportService.exportToCSV();
      
      await Share.open({
        url: `file://${filePath}`,
        type: 'text/csv',
        title: 'Food History Export'
      });
    } catch (error) {
      console.error('Share error:', error);
      throw error;
    }
  }
}; 