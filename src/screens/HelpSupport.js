import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimatedCard from '../components/common/AnimatedCard';
import { SIZES, SHADOWS } from '../constants/theme';

const FAQItem = ({ question, answer, colors }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = new Animated.Value(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <AnimatedCard style={[styles.faqItem, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.faqQuestion, { color: colors.text }]}>
          {question}
        </Text>
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <Icon
            name="chevronDown"
            size={20}
            color={colors.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
          {answer}
        </Text>
      )}
    </AnimatedCard>
  );
};

const HelpSupport = ({ navigation }) => {
  const { colors } = useTheme();

  const faqData = [
    {
      question: "How do I create a new automation?",
      answer: "To create a new automation, go to the Dashboard and tap the '+' button. Follow the step-by-step guide to set up your automation rules and conditions."
    },
    {
      question: "Can I schedule automations?",
      answer: "Yes! You can schedule automations by setting up time-based triggers in the Rule Builder. You can specify exact times, intervals, or recurring schedules."
    },
    {
      question: "How do I monitor automation performance?",
      answer: "Use the Analytics screen to view detailed performance metrics, success rates, and execution history of your automations."
    },
    // Add more FAQ items as needed
  ];

  const supportOptions = [
    {
      icon: 'email',
      title: 'Email Support',
      description: 'Get help via email',
      action: () => Linking.openURL('mailto:support@automationsimulator.com'),
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: () => navigation.navigate('LiveChat'),
    },
    {
      icon: 'documentation',
      title: 'Documentation',
      description: 'Read our detailed guides',
      action: () => navigation.navigate('Documentation'),
    },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <Text style={[styles.headerTitle, { color: colors.card }]}>
        Help & Support
      </Text>
    </View>
  );

  const renderSupportOptions = () => (
    <View style={styles.supportGrid}>
      {supportOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.supportCard,
            { backgroundColor: colors.card }
          ]}
          onPress={option.action}
        >
          <Icon
            name={option.icon}
            size={32}
            color={colors.primary}
            style={styles.supportIcon}
          />
          <Text style={[styles.supportTitle, { color: colors.text }]}>
            {option.title}
          </Text>
          <Text style={[styles.supportDescription, { color: colors.textSecondary }]}>
            {option.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFAQSection = () => (
    <View style={styles.faqSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Frequently Asked Questions
      </Text>
      {faqData.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          colors={colors}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderSupportOptions()}
        {renderFAQSection()}

        <TouchableOpacity
          style={[styles.feedbackButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Feedback')}
        >
          <Icon name="feedback" size={24} color={colors.card} />
          <Text style={[styles.feedbackButtonText, { color: colors.card }]}>
            Send Feedback
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding,
    ...SHADOWS.dark,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.padding,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding * 2,
  },
  supportCard: {
    width: '48%',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  supportIcon: {
    marginBottom: SIZES.base,
  },
  supportTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  supportDescription: {
    fontSize: SIZES.small,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  faqSection: {
    marginBottom: SIZES.padding * 2,
  },
  faqItem: {
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  faqQuestion: {
    flex: 1,
    fontSize: SIZES.font,
    fontWeight: '500',
    marginRight: SIZES.padding,
  },
  faqAnswer: {
    padding: SIZES.padding,
    paddingTop: 0,
    fontSize: SIZES.font,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  feedbackButtonText: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginLeft: SIZES.base,
  },
});

export default HelpSupport; 