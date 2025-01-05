import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../common/Icon';
import { SIZES } from '../../constants/theme';

const FilterModal = ({
  visible,
  onClose,
  onApply,
  filters,
  initialFilters = {},
}) => {
  const { colors } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: typeof value === 'boolean' ? value : value,
    }));
  };

  const renderFilterItem = (item) => {
    switch (item.type) {
      case 'toggle':
        return (
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            <Switch
              value={selectedFilters[item.key] || false}
              onValueChange={(value) => handleFilterChange(item.key, value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        );

      case 'select':
        return (
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            <View style={styles.optionsContainer}>
              {item.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        selectedFilters[item.key] === option.value
                          ? colors.primary
                          : colors.card,
                    },
                  ]}
                  onPress={() => handleFilterChange(item.key, option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selectedFilters[item.key] === option.value
                            ? colors.card
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'range':
        return (
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            {/* Add range slider component here */}
          </View>
        );

      default:
        return null;
    }
  };

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  const handleReset = () => {
    setSelectedFilters({});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersContainer}>
            {filters.map((filter) => (
              <View key={filter.key} style={styles.filterGroup}>
                {renderFilterItem(filter)}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingTop: SIZES.padding,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingHorizontal: SIZES.padding,
  },
  filterGroup: {
    marginBottom: SIZES.padding,
  },
  filterSection: {
    marginBottom: SIZES.padding,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  filterLabel: {
    fontSize: SIZES.font,
    marginBottom: SIZES.base,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.base,
  },
  optionButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
    marginBottom: SIZES.base,
  },
  optionText: {
    fontSize: SIZES.font,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: SIZES.base,
  },
  resetButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
});

export default FilterModal; 