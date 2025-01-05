import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const NutritionItem = ({ label, value, unit }) => (
  <View style={styles.nutritionItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value} {unit}</Text>
  </View>
);

const NutritionalInfo = ({ data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutritional Information</Text>
      <ScrollView style={styles.scrollContainer}>
        <NutritionItem 
          label="Calories" 
          value={data.calories || '0'} 
          unit="kcal" 
        />
        <NutritionItem 
          label="Protein" 
          value={data.protein || '0'} 
          unit="g" 
        />
        <NutritionItem 
          label="Carbohydrates" 
          value={data.carbs || '0'} 
          unit="g" 
        />
        <NutritionItem 
          label="Fat" 
          value={data.fat || '0'} 
          unit="g" 
        />
        <NutritionItem 
          label="Fiber" 
          value={data.fiber || '0'} 
          unit="g" 
        />
        <NutritionItem 
          label="Sugar" 
          value={data.sugar || '0'} 
          unit="g" 
        />
        <View style={styles.servingInfo}>
          <Text style={styles.servingText}>
            Serving Size: {data.servingSize || '100g'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SIZES.medium,
    marginVertical: SIZES.small,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  label: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  value: {
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  servingInfo: {
    marginTop: SIZES.medium,
    padding: SIZES.small,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
  },
  servingText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default NutritionalInfo; 