import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const ConflictResolution = ({ 
  visible, 
  conflict, 
  onResolve, 
  onCancel 
}) => {
  const renderConflictDetails = () => {
    const { localData, serverData, type } = conflict;

    switch (type) {
      case 'FOOD_DATA':
        return (
          <View style={styles.detailsContainer}>
            <View style={styles.dataColumn}>
              <Text style={styles.columnHeader}>Local Version</Text>
              <Text style={styles.dataText}>
                Name: {localData.name}
              </Text>
              <Text style={styles.dataText}>
                Calories: {localData.calories}
              </Text>
            </View>
            <View style={styles.dataColumn}>
              <Text style={styles.columnHeader}>Server Version</Text>
              <Text style={styles.dataText}>
                Name: {serverData.name}
              </Text>
              <Text style={styles.dataText}>
                Calories: {serverData.calories}
              </Text>
            </View>
          </View>
        );
      // Add more conflict types as needed
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Data Conflict Detected</Text>
          
          <ScrollView style={styles.scrollContent}>
            {renderConflictDetails()}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.keepLocalButton]}
              onPress={() => onResolve('local')}
            >
              <Text style={styles.buttonText}>Keep Local</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.keepServerButton]}
              onPress={() => onResolve('server')}
            >
              <Text style={styles.buttonText}>Keep Server</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.mergeButton]}
              onPress={() => onResolve('merge')}
            >
              <Text style={styles.buttonText}>Merge</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Decide Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SIZES.medium,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  scrollContent: {
    maxHeight: 300,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.medium,
  },
  dataColumn: {
    flex: 1,
    padding: SIZES.small,
  },
  columnHeader: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    marginBottom: SIZES.small,
  },
  dataText: {
    fontSize: SIZES.font,
    marginBottom: SIZES.small,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.medium,
  },
  button: {
    flex: 1,
    padding: SIZES.small,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  keepLocalButton: {
    backgroundColor: COLORS.primary,
  },
  keepServerButton: {
    backgroundColor: COLORS.secondary,
  },
  mergeButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.font,
  },
  cancelButton: {
    marginTop: SIZES.medium,
    padding: SIZES.small,
  },
  cancelText: {
    color: COLORS.gray,
    textAlign: 'center',
    fontSize: SIZES.font,
  },
});

export default ConflictResolution; 