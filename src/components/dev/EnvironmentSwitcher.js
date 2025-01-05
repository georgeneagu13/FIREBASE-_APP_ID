import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENV_KEY = '@selected_environment';

const EnvironmentSwitcher = ({ visible, onClose, onSelect }) => {
  const environments = ['dev', 'staging', 'prod'];

  const handleSelectEnvironment = async (env) => {
    try {
      await AsyncStorage.setItem(ENV_KEY, env);
      onSelect(env);
      onClose();
    } catch (error) {
      console.error('Failed to save environment:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Environment</Text>
          
          {environments.map((env) => (
            <TouchableOpacity
              key={env}
              style={styles.envButton}
              onPress={() => handleSelectEnvironment(env)}
            >
              <Text style={styles.envButtonText}>
                {env.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SIZES.medium,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.medium,
  },
  envButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.small,
  },
  envButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: SIZES.small,
  },
  cancelButtonText: {
    color: COLORS.gray,
    textAlign: 'center',
    fontSize: SIZES.font,
  },
});

export default EnvironmentSwitcher; 