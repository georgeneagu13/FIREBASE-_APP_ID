import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { authService } from '../../services/authService';
import LoadingOverlay from '../../components/LoadingOverlay';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      await authService.signInWithEmail(email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Signing in..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to FoodAI</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleEmailLogin}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.medium,
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.extraLarge,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.medium,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.extraLarge,
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  linkText: {
    color: COLORS.primary,
    textAlign: 'center',
    fontSize: SIZES.font,
  },
});

export default LoginScreen; 