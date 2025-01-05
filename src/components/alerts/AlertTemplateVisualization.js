import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { alertResponseTemplate } from '../../services/alertResponseTemplateService';
import { alertPatternDetection } from '../../services/alertPatternDetectionService';
import { BarChart, LineChart } from 'react-native-chart-kit';

const AlertTemplateVisualization = () => {
  const [templates, setTemplates] = useState({ default: [], custom: [] });
  const [patterns, setPatterns] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [animation] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('templates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const templateData = alertResponseTemplate.getTemplates();
    setTemplates(templateData);

    const patternData = await alertPatternDetection.detectPatterns();
    setPatterns(patternData?.patterns || []);
  };

  const handleTemplatePress = (template) => {
    setSelectedTemplate(template);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseDetails = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedTemplate(null));
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['templates', 'patterns', 'usage'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.activeTab,
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTemplateList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>Default Templates</Text>
      {templates.default.map(([name, template]) => (
        <TouchableOpacity
          key={name}
          style={styles.templateItem}
          onPress={() => handleTemplatePress(template)}
        >
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateType}>{template.type}</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, styles.customTitle]}>
        Custom Templates
      </Text>
      {templates.custom.map(([name, template]) => (
        <TouchableOpacity
          key={name}
          style={[styles.templateItem, styles.customTemplate]}
          onPress={() => handleTemplatePress(template)}
        >
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateType}>{template.type}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPatternAnalysis = () => (
    <View style={styles.patternContainer}>
      <Text style={styles.sectionTitle}>Pattern Distribution</Text>
      <BarChart
        data={{
          labels: patterns.slice(0, 5).map(([pattern]) => 
            pattern.split(',')[0]
          ),
          datasets: [{
            data: patterns.slice(0, 5).map(([_, data]) => 
              data.occurrences
            ),
          }],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.primary,
          backgroundGradientFrom: COLORS.primary,
          backgroundGradientTo: COLORS.secondary,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={styles.chart}
      />

      <Text style={styles.sectionTitle}>Pattern Confidence</Text>
      <LineChart
        data={{
          labels: patterns.slice(0, 5).map(([pattern]) => 
            pattern.split(',')[0]
          ),
          datasets: [{
            data: patterns.slice(0, 5).map(([_, data]) => 
              data.confidence
            ),
          }],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.primary,
          backgroundGradientFrom: COLORS.primary,
          backgroundGradientTo: COLORS.secondary,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );

  const renderTemplateDetails = () => {
    if (!selectedTemplate) return null;

    return (
      <Animated.View
        style={[
          styles.detailsContainer,
          {
            transform: [{
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>{selectedTemplate.name}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseDetails}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailsContent}>
          <Text style={styles.detailsLabel}>Type</Text>
          <Text style={styles.detailsValue}>{selectedTemplate.type}</Text>

          <Text style={styles.detailsLabel}>Format</Text>
          <Text style={styles.detailsValue}>{selectedTemplate.format}</Text>

          <Text style={styles.detailsLabel}>Template Content</Text>
          <Text style={styles.templateContent}>
            {selectedTemplate.content}
          </Text>

          {selectedTemplate.modified && (
            <>
              <Text style={styles.detailsLabel}>Last Modified</Text>
              <Text style={styles.detailsValue}>
                {new Date(selectedTemplate.modified).toLocaleString()}
              </Text>
            </>
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      <ScrollView>
        {activeTab === 'templates' && renderTemplateList()}
        {activeTab === 'patterns' && renderPatternAnalysis()}
      </ScrollView>
      {renderTemplateDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: SIZES.small,
    backgroundColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    padding: SIZES.small,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: SIZES.font,
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  customTitle: {
    marginTop: SIZES.large,
  },
  templateItem: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.small,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customTemplate: {
    borderLeftColor: COLORS.secondary,
  },
  templateName: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  templateType: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.small,
  },
  patternContainer: {
    padding: SIZES.medium,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SIZES.small,
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.medium,
    maxHeight: '80%',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  detailsTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: SIZES.small,
  },
  closeButtonText: {
    fontSize: SIZES.extraLarge,
    color: COLORS.gray,
  },
  detailsContent: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.small,
    marginTop: SIZES.medium,
  },
  detailsValue: {
    fontSize: SIZES.font,
  },
  templateContent: {
    fontSize: SIZES.font,
    fontFamily: 'monospace',
    backgroundColor: COLORS.lightGray,
    padding: SIZES.small,
    borderRadius: 4,
  },
});

export default AlertTemplateVisualization; 