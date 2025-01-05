import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text,
  Alert 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import CachedImage from '../components/CachedImage';
import NutritionalInfo from '../components/NutritionalInfo';
import LoadingOverlay from '../components/LoadingOverlay';

const ResultsScreen = ({ route, navigation }) => {
  const { imageUri, results } = route.params || {};
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    try {
      // Here you would normally fetch nutrition data from your API
      // For now, we'll use mock data
      const mockData = {
        calories: '256',
        protein: '12',
        carbs: '45',
        fat: '6',
        fiber: '3',
        sugar: '2',
        servingSize: '100g'
      };
      
      setNutritionData(mockData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load nutritional information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading nutritional information..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <CachedImage 
            uri={imageUri} 
            style={styles.image}
          />
        </View>
        
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>Analysis Results</Text>
          {results?.map((item, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.confidence}>
                Confidence: {Math.round(item.confidence * 100)}%
              </Text>
            </View>
          ))}
          
          {nutritionData && (
            <NutritionalInfo data={nutritionData} />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Take Another Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resultsContainer: {
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  resultItem: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: 10,
    marginBottom: SIZES.small,
  },
  foodName: {
    fontSize: SIZES.large,
    fontWeight: '600',
  },
  confidence: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    margin: SIZES.medium,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
});

export default ResultsScreen; 