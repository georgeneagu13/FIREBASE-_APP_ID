import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../common/Icon';
import { SIZES } from '../../constants/theme';

const SearchBar = ({
  onSearch,
  placeholder = 'Search...',
  autoFocus = false,
  showFilterButton = true,
  onFilterPress,
}) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const handleFocus = () => {
    Animated.spring(animatedWidth, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!query) {
      Animated.spring(animatedWidth, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleChangeText = (text) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.searchSection}>
        <Icon
          name="search"
          size={20}
          color={colors.textSecondary}
          containerStyle={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: colors.text }
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
          >
            <Icon
              name="close"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {showFilterButton && (
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.primary }
          ]}
          onPress={onFilterPress}
        >
          <Icon
            name="filter"
            size={20}
            color={colors.card}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
    paddingRight: SIZES.base,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    padding: SIZES.padding,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.padding,
    fontSize: SIZES.font,
  },
  clearButton: {
    padding: SIZES.base,
  },
  filterButton: {
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.base,
  },
});

export default SearchBar; 