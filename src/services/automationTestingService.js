import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertResponseAutomation } from './alertResponseAutomationService';
import { automationRuleBuilder } from './automationRuleBuilderService';

class AutomationTestingService {
  constructor() {
    this.testCases = new Map();
    this.testSuites = new Map();
    this.testResults = new Map();
    this.mockData = new Map();
    this.config = {
      timeout: 30000,
      retries: 3,
      parallel: true,
      maxParallel: 5,
      reportDetail: 'full',
    };
  }

  async createTestCase(config) {
    try {
      const testCase = {
        id: Date.now().toString(),
        ...config,
        created: Date.now(),
        modified: Date.now(),
        status: 'active',
        results: [],
      };

      // Validate test case
      await this.validateTestCase(testCase);

      // Store test case
      this.testCases.set(testCase.id, testCase);

      return testCase;
    } catch (error) {
      console.error('Create test case error:', error);
      throw error;
    }
  }

  async createTestSuite(config) {
    try {
      const suite = {
        id: Date.now().toString(),
        ...config,
        created: Date.now(),
        modified: Date.now(),
        status: 'active',
        results: [],
      };

      // Validate test suite
      await this.validateTestSuite(suite);

      // Store test suite
      this.testSuites.set(suite.id, suite);

      return suite;
    } catch (error) {
      console.error('Create test suite error:', error);
      throw error;
    }
  }

  async runTest(testId) {
    const testCase = this.testCases.get(testId);
    if (!testCase) {
      throw new Error(`Test case not found: ${testId}`);
    }

    try {
      // Setup test environment
      await this.setupTestEnvironment(testCase);

      // Execute test
      const result = await this.executeTest(testCase);

      // Store result
      this.storeTestResult(testId, result);

      // Log test execution
      await this.logTestExecution(testCase, result);

      return result;
    } catch (error) {
      console.error('Run test error:', error);
      throw error;
    }
  }

  async runTestSuite(suiteId) {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite not found: ${suiteId}`);
    }

    try {
      const results = [];
      const startTime = Date.now();

      if (this.config.parallel) {
        // Run tests in parallel
        const batches = this.createTestBatches(suite.tests, this.config.maxParallel);
        for (const batch of batches) {
          const batchResults = await Promise.all(
            batch.map(testId => this.runTest(testId))
          );
          results.push(...batchResults);
        }
      } else {
        // Run tests sequentially
        for (const testId of suite.tests) {
          const result = await this.runTest(testId);
          results.push(result);
        }
      }

      const suiteResult = {
        suiteId,
        results,
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        success: results.every(r => r.success),
      };

      // Store suite result
      this.storeSuiteResult(suiteId, suiteResult);

      // Log suite execution
      await this.logSuiteExecution(suite, suiteResult);

      return suiteResult;
    } catch (error) {
      console.error('Run test suite error:', error);
      throw error;
    }
  }

  createTestBatches(tests, batchSize) {
    const batches = [];
    for (let i = 0; i < tests.length; i += batchSize) {
      batches.push(tests.slice(i, i + batchSize));
    }
    return batches;
  }

  async validateTestCase(testCase) {
    const errors = [];

    if (!testCase.name) errors.push('Test case name is required');
    if (!testCase.type) errors.push('Test case type is required');
    if (!testCase.inputs) errors.push('Test case inputs are required');
    if (!testCase.expectedResults) errors.push('Expected results are required');

    if (errors.length > 0) {
      throw new Error(`Invalid test case: ${errors.join(', ')}`);
    }
  }

  async validateTestSuite(suite) {
    const errors = [];

    if (!suite.name) errors.push('Test suite name is required');
    if (!suite.tests || !Array.isArray(suite.tests)) {
      errors.push('Test suite must contain an array of tests');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid test suite: ${errors.join(', ')}`);
    }
  }

  async setupTestEnvironment(testCase) {
    // Setup mock data
    const mocks = this.mockData.get(testCase.type) || [];
    for (const mock of mocks) {
      await mock.setup(testCase);
    }
  }

  async executeTest(testCase) {
    const startTime = Date.now();
    let attempt = 0;
    let error = null;

    while (attempt < this.config.retries) {
      try {
        // Execute test logic
        const outputs = await this.executeTestLogic(testCase);

        // Validate outputs
        const validationResult = this.validateTestOutputs(
          outputs,
          testCase.expectedResults
        );

        return {
          testId: testCase.id,
          success: validationResult.success,
          outputs,
          validation: validationResult,
          startTime,
          endTime: Date.now(),
          duration: Date.now() - startTime,
          attempt: attempt + 1,
        };
      } catch (e) {
        error = e;
        attempt++;
        if (attempt < this.config.retries) {
          await new Promise(resolve => 
            setTimeout(resolve, 1000 * attempt)
          );
        }
      }
    }

    return {
      testId: testCase.id,
      success: false,
      error: error.message,
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      attempt: attempt,
    };
  }

  async executeTestLogic(testCase) {
    switch (testCase.type) {
      case 'rule':
        return this.executeRuleTest(testCase);
      case 'workflow':
        return this.executeWorkflowTest(testCase);
      case 'integration':
        return this.executeIntegrationTest(testCase);
      default:
        throw new Error(`Unknown test type: ${testCase.type}`);
    }
  }

  validateTestOutputs(outputs, expected) {
    const results = {
      success: true,
      matches: [],
      mismatches: [],
    };

    for (const [key, value] of Object.entries(expected)) {
      const output = outputs[key];
      const matches = this.compareValues(output, value);
      
      if (matches) {
        results.matches.push(key);
      } else {
        results.success = false;
        results.mismatches.push({
          key,
          expected: value,
          actual: output,
        });
      }
    }

    return results;
  }

  compareValues(actual, expected) {
    if (typeof expected === 'object' && expected !== null) {
      return JSON.stringify(actual) === JSON.stringify(expected);
    }
    return actual === expected;
  }

  storeTestResult(testId, result) {
    const testCase = this.testCases.get(testId);
    if (testCase) {
      testCase.results.unshift(result);
      testCase.modified = Date.now();
      this.testCases.set(testId, testCase);
    }
    this.testResults.set(result.startTime.toString(), result);
  }

  storeSuiteResult(suiteId, result) {
    const suite = this.testSuites.get(suiteId);
    if (suite) {
      suite.results.unshift(result);
      suite.modified = Date.now();
      this.testSuites.set(suiteId, suite);
    }
    this.testResults.set(result.startTime.toString(), result);
  }

  async logTestExecution(testCase, result) {
    try {
      await enhancedAnalytics.logEvent('test_executed', {
        testId: testCase.id,
        testName: testCase.name,
        testType: testCase.type,
        success: result.success,
        duration: result.duration,
        attempt: result.attempt,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log test execution error:', error);
    }
  }

  async logSuiteExecution(suite, result) {
    try {
      await enhancedAnalytics.logEvent('suite_executed', {
        suiteId: suite.id,
        suiteName: suite.name,
        testCount: suite.tests.length,
        successCount: result.results.filter(r => r.success).length,
        duration: result.duration,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log suite execution error:', error);
    }
  }

  registerMock(type, mock) {
    const mocks = this.mockData.get(type) || [];
    mocks.push(mock);
    this.mockData.set(type, mocks);
  }

  getTestCase(id) {
    return this.testCases.get(id);
  }

  getTestSuite(id) {
    return this.testSuites.get(id);
  }

  getTestResults(filter = {}) {
    let results = Array.from(this.testResults.values());

    if (filter.success !== undefined) {
      results = results.filter(r => r.success === filter.success);
    }
    if (filter.type) {
      results = results.filter(r => {
        const testCase = this.getTestCase(r.testId);
        return testCase && testCase.type === filter.type;
      });
    }
    if (filter.startDate) {
      results = results.filter(r => r.startTime >= filter.startDate);
    }
    if (filter.endDate) {
      results = results.filter(r => r.startTime <= filter.endDate);
    }

    return results;
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const automationTesting = new AutomationTestingService(); 