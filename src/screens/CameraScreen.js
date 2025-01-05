import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { COLORS, SIZES } from '../constants/theme';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorMessage from '../components/ErrorMessage';
import { recognizeFood } from '../services/foodRecognitionService';
import { storageService } from '../services/storageService';

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'authorized');
      } catch (err) {
        setError('Camera permission is required to use this feature');
      }
    })();
  }, []);

  const onCapture = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!device || !camera.current) {
        throw new Error('Camera not ready');
      }

      const photo = await camera.current.takePhoto({
        qualityPriority: 'quality',
        flash: 'off',
      });

      const results = await recognizeFood(photo.path);
      
      await storageService.saveFoodScan({
        imageUri: `file://${photo.path}`,
        results: results
      });

      navigation.navigate('Results', {
        imageUri: `file://${photo.path}`,
        results: results
      });
    } catch (err) {
      setError(err.message || 'Failed to process photo');
      Alert.alert('Error', 'Failed to process photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [device, navigation]);

  if (!device || !hasPermission) {
    return (
      <View style={styles.container}>
        <ErrorMessage 
          message={error || 'Camera not available'} 
          onRetry={() => navigation.replace('Camera')}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      
      {isLoading && (
        <LoadingOverlay message="Analyzing your food..." />
      )}
      
      {error && (
        <ErrorMessage 
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      <TouchableOpacity 
        style={styles.captureButton}
        onPress={onCapture}
        disabled={isLoading}
      >
        <View style={[
          styles.captureInner,
          isLoading && styles.captureButtonDisabled
        ]} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  captureButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
});

export default CameraScreen;