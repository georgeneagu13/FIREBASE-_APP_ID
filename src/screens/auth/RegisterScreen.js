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

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      setLoading(true);
      await authService.createUser(email, password, name);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Creating account..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
  registerButton: {
    backgroundColor: COLORS.primary,
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

export default RegisterScreen; 