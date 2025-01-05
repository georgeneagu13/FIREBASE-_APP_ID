import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/styles/hljs';
import { useTheme } from '../../context/ThemeContext';
import { SIZES } from '../../constants/theme';

const CodeBlock = ({ code, language = 'javascript', style }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <ScrollView
          style={[
            styles.codeContainer,
            { backgroundColor: isDarkMode ? '#1E1E1E' : '#F8F8F8' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <SyntaxHighlighter
            language={language}
            style={vs2015}
            customStyle={styles.highlighter}
            fontSize={SIZES.small}
          >
            {code}
          </SyntaxHighlighter>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  codeContainer: {
    padding: SIZES.padding,
    minWidth: '100%',
  },
  highlighter: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
});

export default CodeBlock; 