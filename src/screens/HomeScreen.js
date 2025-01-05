import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useOfflineData } from '../hooks/useOfflineData';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorMessage from '../components/ErrorMessage';
import { notificationService } from '../services/notificationService';
import { offlineService } from '../services/offlineService';

const HomeScreen = ({ navigation }) => {
  const { 
    data: recentScans, 
    loading, 
    error, 
    isOnline 
  } = useOfflineData('recentScans', async () => {
    // Your API call here
    return [];
  });

  const handleScanFood = async () => {
    try {
      if (!isOnline) {
        // Add to offline queue
        await offlineService.addToQueue({
          type: 'SCAN_FOOD',
          timestamp: new Date().toISOString(),
        });
        
        // Show offline notification
        notificationService.showLocalNotification(
          'Offline Mode',
          'Your scan will be processed when you\'re back online'
        );
      }
      
      navigation.navigate('Camera');
    } catch (error) {
      console.error('Scan error:', error);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading recent scans..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            You're offline. Some features may be limited.
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>FoodAI</Text>
      </View>

      <TouchableOpacity 
        style={styles.scanButton}
        onPress={handleScanFood}
      >
        <Text style={styles.scanButtonText}>Scan Food</Text>
      </TouchableOpacity>

      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        <FlatList
          data={recentScans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.recentItem}
              onPress={() => navigation.navigate('Results', { id: item.id })}
            >
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No recent scans. Start by scanning some food!
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  offlineBanner: {
    backgroundColor: COLORS.error,
    padding: SIZES.small,
  },
  offlineText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.font,
  },
  header: {
    padding: SIZES.medium,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    margin: SIZES.medium,
    padding: SIZES.medium,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: '600',
  },
  recentContainer: {
    flex: 1,
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  recentItem: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: 10,
    marginBottom: SIZES.small,
  },
  foodName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: SIZES.medium,
    marginTop: 50,
  },
});

export default HomeScreen; 