import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { automationRuleBuilder } from '../services/automationRuleBuilderService';

const RuleBuilder = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    conditions: [],
    actions: [],
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const existingRules = await automationRuleBuilder.getRules();
      setRules(existingRules);
    } catch (error) {
      console.error('Load rules error:', error);
      Alert.alert('Error', 'Failed to load rules');
    }
  };

  const addCondition = () => {
    setNewRule(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { type: '', value: '', operator: '=' }
      ],
    }));
  };

  const addAction = () => {
    setNewRule(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        { type: '', params: {} }
      ],
    }));
  };

  const updateCondition = (index, field, value) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const updateAction = (index, field, value) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      ),
    }));
  };

  const saveRule = async () => {
    try {
      if (!newRule.name) {
        Alert.alert('Error', 'Rule name is required');
        return;
      }

      const rule = await automationRuleBuilder.createRule(newRule);
      setRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        description: '',
        conditions: [],
        actions: [],
      });
      setShowForm(false);
      Alert.alert('Success', 'Rule created successfully');
    } catch (error) {
      console.error('Save rule error:', error);
      Alert.alert('Error', 'Failed to create rule');
    }
  };

  const deleteRule = async (ruleId) => {
    try {
      await automationRuleBuilder.deleteRule(ruleId);
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      Alert.alert('Success', 'Rule deleted successfully');
    } catch (error) {
      console.error('Delete rule error:', error);
      Alert.alert('Error', 'Failed to delete rule');
    }
  };

  const renderRuleCard = (rule) => (
    <View key={rule.id} style={styles.ruleCard}>
      <View style={styles.ruleHeader}>
        <Text style={styles.ruleName}>{rule.name}</Text>
        <TouchableOpacity
          onPress={() => deleteRule(rule.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.ruleDescription}>{rule.description}</Text>
      
      <View style={styles.ruleSection}>
        <Text style={styles.sectionTitle}>Conditions:</Text>
        {rule.conditions.map((condition, index) => (
          <Text key={index} style={styles.conditionText}>
            {condition.type} {condition.operator} {condition.value}
          </Text>
        ))}
      </View>

      <View style={styles.ruleSection}>
        <Text style={styles.sectionTitle}>Actions:</Text>
        {rule.actions.map((action, index) => (
          <Text key={index} style={styles.actionText}>
            {action.type}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderRuleForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Rule Name"
        value={newRule.name}
        onChangeText={(text) => setNewRule(prev => ({ ...prev, name: text }))}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={newRule.description}
        onChangeText={(text) => setNewRule(prev => ({ ...prev, description: text }))}
        multiline
      />

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Conditions:</Text>
        {newRule.conditions.map((condition, index) => (
          <View key={index} style={styles.conditionForm}>
            <TextInput
              style={styles.conditionInput}
              placeholder="Type"
              value={condition.type}
              onChangeText={(text) => updateCondition(index, 'type', text)}
            />
            <TextInput
              style={styles.conditionInput}
              placeholder="Value"
              value={condition.value}
              onChangeText={(text) => updateCondition(index, 'value', text)}
            />
          </View>
        ))}
        <TouchableOpacity onPress={addCondition} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Condition</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Actions:</Text>
        {newRule.actions.map((action, index) => (
          <View key={index} style={styles.actionForm}>
            <TextInput
              style={styles.actionInput}
              placeholder="Type"
              value={action.type}
              onChangeText={(text) => updateAction(index, 'type', text)}
            />
          </View>
        ))}
        <TouchableOpacity onPress={addAction} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Action</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={saveRule} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Rule</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rule Builder</Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>
            {showForm ? 'View Rules' : 'Create Rule'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {showForm ? renderRuleForm() : (
          rules.map(rule => renderRuleCard(rule))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerButton: {
    backgroundColor: COLORS.white,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
  headerButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  ruleCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  ruleName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  ruleDescription: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: SIZES.base,
  },
  ruleSection: {
    marginTop: SIZES.base,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  conditionText: {
    fontSize: SIZES.font,
    marginBottom: 4,
  },
  actionText: {
    fontSize: SIZES.font,
    marginBottom: 4,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginBottom: SIZES.base,
  },
  formSection: {
    marginTop: SIZES.padding,
  },
  conditionForm: {
    flexDirection: 'row',
    marginBottom: SIZES.base,
  },
  conditionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginRight: SIZES.base,
  },
  actionForm: {
    marginBottom: SIZES.base,
  },
  actionInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.medium,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: SIZES.small,
  },
});

export default RuleBuilder; 