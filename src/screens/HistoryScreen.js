import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { storageService } from '../services/storageService';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorMessage from '../components/ErrorMessage';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      setError(null);
      const data = await storageService.getFoodHistory();
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => navigation.navigate('Results', { 
        imageUri: item.imageUri,
        results: item.results,
        fromHistory: true
      })}
    >
      <Image 
        source={{ uri: item.imageUri }} 
        style={styles.thumbnail}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.foodName}>
          {item.results[0]?.name || 'Unknown Food'}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingOverlay message="Loading history..." />;
  }

  return (
    <View style={styles.container}>
      {error ? (
        <ErrorMessage message={error} onRetry={loadHistory} />
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No history yet</Text>
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
  listContainer: {
    padding: SIZES.medium,
  },
  historyItem: {
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
  timestamp: {
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

export default HistoryScreen; 