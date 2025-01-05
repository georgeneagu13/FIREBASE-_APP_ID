import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import { SIZES, SHADOWS } from '../constants/theme';
import { userProfile } from '../services/userProfileService';
import AnimationSystem from '../utils/AnimationSystem';

const EditProfile = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { profile: initialProfile } = route.params;
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);

  const handleImagePick = () => {
    const options = {
      title: 'Select Profile Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
      includeBase64: true,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else {
        const source = { uri: response.assets[0].uri };
        setProfile(prev => ({
          ...prev,
          avatar: source.uri,
          avatarBase64: response.assets[0].base64,
        }));
      }
    });
  };

  const validateForm = () => {
    if (!profile.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!profile.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    // Add more validation as needed
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await userProfile.updateProfile(profile);
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevronLeft" size={24} color={colors.card} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.card }]}>
        Edit Profile
      </Text>
      <TouchableOpacity
        style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={[styles.saveButtonText, { color: colors.card }]}>
          {loading ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={
            profile?.avatar
              ? { uri: profile.avatar }
              : require('../assets/images/default-avatar.png')
          }
          style={styles.avatar}
        />
        <View style={[styles.editIconContainer, { backgroundColor: colors.primary }]}>
          <Icon name="edit" size={16} color={colors.card} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderFormField = (label, value, key, options = {}) => (
    <View style={styles.formField}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          { 
            color: colors.text,
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        value={value}
        onChangeText={(text) => setProfile(prev => ({ ...prev, [key]: text }))}
        placeholderTextColor={colors.textSecondary}
        {...options}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderAvatarSection()}

        <View style={styles.form}>
          {renderFormField('Name', profile?.name || '', 'name', {
            placeholder: 'Enter your name',
            autoCapitalize: 'words',
          })}
          
          {renderFormField('Email', profile?.email || '', 'email', {
            placeholder: 'Enter your email',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}
          
          {renderFormField('Phone', profile?.phone || '', 'phone', {
            placeholder: 'Enter your phone number',
            keyboardType: 'phone-pad',
          })}
          
          {renderFormField('Bio', profile?.bio || '', 'bio', {
            placeholder: 'Tell us about yourself',
            multiline: true,
            numberOfLines: 4,
            textAlignVertical: 'top',
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    ...SHADOWS.dark,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: SIZES.base,
  },
  saveButtonText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  form: {
    padding: SIZES.padding,
  },
  formField: {
    marginBottom: SIZES.padding,
  },
  label: {
    fontSize: SIZES.font,
    marginBottom: SIZES.base,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.font,
    minHeight: 48,
  },
});

export default EditProfile; 