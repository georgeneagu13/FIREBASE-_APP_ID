import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from '../common/Icon';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, SHADOWS } from '../../constants/theme';

const FormInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  maxLength,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const animatedValue = new Animated.Value(value ? 1 : 0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.(e);
  };

  const labelStyle = {
    position: 'absolute',
    left: SIZES.padding,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [SIZES.padding, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [SIZES.font, SIZES.small],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textSecondary, colors.primary],
    }),
    backgroundColor: colors.background,
    paddingHorizontal: SIZES.base,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>

      <View style={[
        styles.inputContainer,
        {
          borderColor: error && touched
            ? colors.error
            : isFocused
              ? colors.primary
              : colors.border,
        },
      ]}>
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.secureButton}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Icon
              name={isSecure ? 'eyeOff' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && touched && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding * 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    minHeight: 56,
    paddingHorizontal: SIZES.padding,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: SIZES.font,
    paddingVertical: SIZES.padding,
  },
  secureButton: {
    padding: SIZES.base,
  },
  error: {
    marginTop: SIZES.base,
    fontSize: SIZES.small,
    marginLeft: SIZES.padding,
  },
});

export default FormInput; 