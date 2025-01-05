import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimatedCard from '../components/common/AnimatedCard';
import CodeBlock from '../components/common/CodeBlock';
import { SIZES, SHADOWS } from '../constants/theme';

const Documentation = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const scrollViewRef = useRef(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      content: [
        {
          type: 'text',
          content: 'Welcome to the Automation Simulator documentation. This guide will help you get started with creating and managing your automations.',
        },
        {
          type: 'code',
          language: 'javascript',
          title: 'Basic Setup',
          content: `import { AutomationBuilder } from '@automation/core';

const automation = new AutomationBuilder()
  .setName('My First Automation')
  .setTrigger('onEvent')
  .setCondition((event) => event.type === 'user_action')
  .setAction(async (context) => {
    // Your automation logic here
    await performTask(context);
  })
  .build();`,
        },
      ],
    },
    'triggers': {
      title: 'Triggers',
      content: [
        {
          type: 'text',
          content: 'Triggers are events that start your automation. They can be time-based, event-based, or condition-based.',
        },
        {
          type: 'code',
          language: 'javascript',
          title: 'Time-based Trigger',
          content: `automation.setTrigger({
  type: 'schedule',
  cron: '0 9 * * *', // Every day at 9 AM
  timezone: 'UTC'
});`,
        },
      ],
    },
    'conditions': {
      title: 'Conditions',
      content: [
        {
          type: 'text',
          content: 'Conditions determine whether your automation should run based on specific criteria.',
        },
        {
          type: 'code',
          language: 'javascript',
          title: 'Multiple Conditions',
          content: `automation.setConditions([
  {
    type: 'compare',
    field: 'temperature',
    operator: 'gt',
    value: 25
  },
  {
    type: 'time',
    between: ['08:00', '18:00']
  }
]);`,
        },
      ],
    },
    'actions': {
      title: 'Actions',
      content: [
        {
          type: 'text',
          content: 'Actions are the tasks that your automation performs when triggered and conditions are met.',
        },
        {
          type: 'code',
          language: 'javascript',
          title: 'Parallel Actions',
          content: `automation.setActions([
  async (context) => {
    await sendNotification(context.user);
  },
  async (context) => {
    await updateDatabase(context.data);
  }
]);`,
        },
      ],
    },
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
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
        Documentation
      </Text>
    </View>
  );

  const renderSearch = () => (
    <AnimatedCard style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <Icon name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search documentation..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
    </AnimatedCard>
  );

  const renderNavigation = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.navigation}
      contentContainerStyle={styles.navigationContent}
    >
      {Object.entries(sections).map(([key, section]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.navItem,
            activeSection === key && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setActiveSection(key)}
        >
          <Text
            style={[
              styles.navText,
              {
                color: activeSection === key ? colors.card : colors.text,
              },
            ]}
          >
            {section.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderContent = () => (
    <ScrollView
      ref={scrollViewRef}
      style={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {sections[activeSection].content.map((item, index) => (
        <AnimatedCard key={index} style={styles.contentItem}>
          {item.type === 'text' ? (
            <Text style={[styles.contentText, { color: colors.text }]}>
              {item.content}
            </Text>
          ) : (
            <View>
              <Text style={[styles.codeTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <CodeBlock
                code={item.content}
                language={item.language}
                style={styles.codeBlock}
              />
            </View>
          )}
        </AnimatedCard>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderSearch()}
      {renderNavigation()}
      {renderContent()}
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
    padding: SIZES.padding,
    ...SHADOWS.dark,
  },
  backButton: {
    marginRight: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  searchContainer: {
    margin: SIZES.padding,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.base,
    fontSize: SIZES.font,
  },
  navigation: {
    maxHeight: 50,
  },
  navigationContent: {
    padding: SIZES.padding,
  },
  navItem: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
  },
  navText: {
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  contentItem: {
    marginBottom: SIZES.padding,
  },
  contentText: {
    fontSize: SIZES.font,
    lineHeight: SIZES.extraLarge,
  },
  codeTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: SIZES.base,
  },
  codeBlock: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
});

export default Documentation; 