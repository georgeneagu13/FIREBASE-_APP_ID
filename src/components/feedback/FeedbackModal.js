import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Rating } from './Rating';

const FeedbackModal = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');

  const categories = [
    'General', 
    'Bug Report', 
    'Feature Request', 
    'Performance', 
    'Other'
  ];

  const handleSubmit = () => {
    onSubmit({
      rating,
      feedback,
      category,
      email,
      timestamp: new Date().toISOString(),
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setRating(0);
    setFeedback('');
    setCategory('');
    setEmail('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>We'd Love Your Feedback!</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.ratingContainer}>
              <Text style={styles.label}>How would you rate your experience?</Text>
              <Rating
                rating={rating}
                onRatingChange={setRating}
                size={30}
              />
            </View>

            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonSelected
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextSelected
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Your Feedback</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Tell us what you think..."
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email (optional)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.gray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={!rating || !category || !feedback}
              >
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: COLORS.white,
    margin: SIZES.medium,
    borderRadius: 12,
    padding: SIZES.medium,
    maxHeight: '80%',
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: SIZES.small,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  categoryContainer: {
    marginBottom: SIZES.medium,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.small,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.gray,
  },
  categoryTextSelected: {
    color: COLORS.white,
  },
  inputContainer: {
    marginBottom: SIZES.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: SIZES.small,
    fontSize: SIZES.font,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: SIZES.small,
    fontSize: SIZES.font,
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: SIZES.medium,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  cancelButton: {
    padding: SIZES.small,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: SIZES.font,
    textAlign: 'center',
  },
});

export default FeedbackModal; 