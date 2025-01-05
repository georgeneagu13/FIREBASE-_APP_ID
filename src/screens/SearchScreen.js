import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  Text 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { searchService } from '../services/searchService';
import SearchFilters from '../components/SearchFilters';
import CachedImage from '../components/CachedImage';
import ErrorMessage from '../components/ErrorMessage';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoryList = await searchService.getCategories();
      setCategories(categoryList);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        category: selectedCategory,
      };
      
      const searchResults = await searchService.searchFood(query, filters);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to search foods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, selectedCategory]);

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate('Results', {
        imageUri: item.imageUri,
        results: item.results,
        fromSearch: true
      })}
    >
      <CachedImage 
        uri={item.imageUri} 
        style={styles.thumbnail}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.foodName}>
          {item.results[0]?.name || 'Unknown Food'}
        </Text>
        <Text style={styles.category}>
          {item.results[0]?.category || 'Uncategorized'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
      </View>

      <SearchFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClearFilters={() => setSelectedCategory(null)}
      />

      {error ? (
        <ErrorMessage message={error} onRetry={() => handleSearch()} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            !loading && (
              <Text style={styles.emptyText}>
                {searchQuery ? 'No results found' : 'Start searching for foods'}
              </Text>
            )
          }
          ListFooterComponent={
            loading && <ActivityIndicator size="large" color={COLORS.primary} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    padding: SIZES.medium,
  },
  searchInput: {
    height: 45,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.medium,
    fontSize: SIZES.font,
  },
  listContainer: {
    padding: SIZES.medium,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginBottom: SIZES.medium,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  itemInfo: {
    flex: 1,
    padding: SIZES.medium,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: SIZES.medium,
    marginTop: 50,
  },
});

export default SearchScreen; 