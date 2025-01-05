import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const SearchFilters = ({ 
  categories = [], 
  selectedCategory, 
  onSelectCategory,
  onClearFilters 
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedCategory && styles.selectedChip
          ]}
          onPress={onClearFilters}
        >
          <Text style={[
            styles.chipText,
            !selectedCategory && styles.selectedChipText
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.selectedChip
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text style={[
              styles.chipText,
              selectedCategory === category && styles.selectedChipText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.small,
  },
  scrollContent: {
    paddingHorizontal: SIZES.medium,
  },
  filterChip: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.small,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.gray,
    fontSize: SIZES.font,
  },
  selectedChipText: {
    color: COLORS.white,
  },
});

export default SearchFilters; 