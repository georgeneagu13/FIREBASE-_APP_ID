import { enhancedAnalytics } from './enhancedAnalyticsService';
import { automationStateManagement } from './automationStateManagementService';

class AutomationIntegrationService {
  constructor() {
    this.integrations = new Map();
    this.connections = new Map();
    this.transformers = new Map();
    this.webhooks = new Map();
    this.history = [];
    this.maxHistory = 1000;
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      rateLimit: 100,
      rateLimitWindow: 60000,
      maxPayloadSize: 5242880, // 5MB
    };
  }

  async init() {
    try {
      // Register default transformers
      this.registerDefaultTransformers();

      // Initialize rate limiting
      this.initializeRateLimiting();

      // Start webhook listener if any webhooks are registered
      if (this.webhooks.size > 0) {
        this.startWebhookListener();
      }

    } catch (error) {
      console.error('Integration init error:', error);
      throw error;
    }
  }

  async registerIntegration(config) {
    try {
      const integration = {
        id: Date.now().toString(),
        ...config,
        status: 'active',
        created: Date.now(),
        modified: Date.now(),
        stats: {
          requests: 0,
          errors: 0,
          lastSuccess: null,
          lastError: null,
        },
      };

      // Validate integration
      await this.validateIntegration(integration);

      // Test connection
      await this.testConnection(integration);

      // Store integration
      this.integrations.set(integration.id, integration);

      // Log integration registration
      await this.logIntegrationRegistration(integration);

      return integration;

    } catch (error) {
      console.error('Register integration error:', error);
      throw error;
    }
  }

  async createConnection(integrationId, config) {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      const connection = {
        id: Date.now().toString(),
        integrationId,
        ...config,
        status: 'active',
        created: Date.now(),
        modified: Date.now(),
      };

      // Validate connection
      await this.validateConnection(connection);

      // Store connection
      this.connections.set(connection.id, connection);

      // Log connection creation
      await this.logConnectionCreation(connection);

      return connection;

    } catch (error) {
      console.error('Create connection error:', error);
      throw error;
    }
  }

  async executeIntegration(integrationId, data, options = {}) {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      // Check rate limit
      if (!this.checkRateLimit(integrationId)) {
        throw new Error('Rate limit exceeded');
      }

      // Transform data
      const transformedData = await this.transformData(
        data,
        integration.transformers
      );

      // Execute integration
      const result = await this.executeWithRetry(
        async () => {
          const response = await this.executeRequest(
            integration,
            transformedData,
            options
          );
          return this.transformResponse(response, integration.transformers);
        },
        options.retries || this.config.maxRetries
      );

      // Update stats
      this.updateIntegrationStats(integration, true);

      // Log execution
      await this.logIntegrationExecution(integration, result);

      return result;

    } catch (error) {
      // Update stats
      this.updateIntegrationStats(integration, false, error);

      // Log error
      await this.logIntegrationError(integration, error);

      throw error;
    }
  }

  async executeRequest(integration, data, options) {
    const { url, method, headers } = integration.config;
    
    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
      timeout: options.timeout || this.config.timeout,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async executeWithRetry(fn, maxRetries) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, 1000 * attempt)
          );
        }
      }
    }
    throw lastError;
  }

  async transformData(data, transformers = []) {
    let transformed = data;
    for (const transformerId of transformers) {
      const transformer = this.transformers.get(transformerId);
      if (transformer) {
        transformed = await transformer.transform(transformed);
      }
    }
    return transformed;
  }

  async transformResponse(response, transformers = []) {
    let transformed = response;
    for (const transformerId of transformers) {
      const transformer = this.transformers.get(transformerId);
      if (transformer && transformer.transformResponse) {
        transformed = await transformer.transformResponse(transformed);
      }
    }
    return transformed;
  }

  registerTransformer(id, transformer) {
    this.transformers.set(id, transformer);
  }

  registerWebhook(id, config) {
    this.webhooks.set(id, {
      id,
      ...config,
      created: Date.now(),
    });
  }

  registerDefaultTransformers() {
    this.registerTransformer('json', {
      transform: async (data) => JSON.stringify(data),
      transformResponse: async (data) => 
        typeof data === 'string' ? JSON.parse(data) : data,
    });

    this.registerTransformer('xml', {
      transform: async (data) => {
        // Implement XML transformation
        return data;
      },
    });
  }

  initializeRateLimiting() {
    this.rateLimits = new Map();
    setInterval(() => this.resetRateLimits(), this.config.rateLimitWindow);
  }

  checkRateLimit(integrationId) {
    const limit = this.rateLimits.get(integrationId) || 0;
    if (limit >= this.config.rateLimit) {
      return false;
    }
    this.rateLimits.set(integrationId, limit + 1);
    return true;
  }

  resetRateLimits() {
    this.rateLimits.clear();
  }

  startWebhookListener() {
    // Implement webhook listener
    console.log('Webhook listener started');
  }

  async validateIntegration(integration) {
    const errors = [];

    if (!integration.name) errors.push('Integration name is required');
    if (!integration.type) errors.push('Integration type is required');
    if (!integration.config) errors.push('Integration config is required');
    if (!integration.config.url) errors.push('Integration URL is required');

    if (errors.length > 0) {
      throw new Error(`Invalid integration: ${errors.join(', ')}`);
    }
  }

  async validateConnection(connection) {
    const errors = [];

    if (!connection.name) errors.push('Connection name is required');
    if (!connection.config) errors.push('Connection config is required');

    if (errors.length > 0) {
      throw new Error(`Invalid connection: ${errors.join(', ')}`);
    }
  }

  async testConnection(integration) {
    try {
      await this.executeRequest(
        integration,
        { test: true },
        { timeout: 5000 }
      );
      return true;
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  updateIntegrationStats(integration, success, error = null) {
    integration.stats.requests++;
    if (success) {
      integration.stats.lastSuccess = Date.now();
    } else {
      integration.stats.errors++;
      integration.stats.lastError = {
        timestamp: Date.now(),
        message: error.message,
      };
    }
    integration.modified = Date.now();
    this.integrations.set(integration.id, integration);
  }

  async logIntegrationRegistration(integration) {
    try {
      await enhancedAnalytics.logEvent('integration_registered', {
        integrationId: integration.id,
        integrationType: integration.type,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log integration registration error:', error);
    }
  }

  async logConnectionCreation(connection) {
    try {
      await enhancedAnalytics.logEvent('connection_created', {
        connectionId: connection.id,
        integrationId: connection.integrationId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log connection creation error:', error);
    }
  }

  async logIntegrationExecution(integration, result) {
    try {
      await enhancedAnalytics.logEvent('integration_executed', {
        integrationId: integration.id,
        integrationType: integration.type,
        success: true,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log integration execution error:', error);
    }
  }

  async logIntegrationError(integration, error) {
    try {
      await enhancedAnalytics.logEvent('integration_error', {
        integrationId: integration.id,
        integrationType: integration.type,
        error: error.message,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log integration error error:', error);
    }
  }

  getIntegrations(filter = {}) {
    let integrations = Array.from(this.integrations.values());

    if (filter.type) {
      integrations = integrations.filter(i => i.type === filter.type);
    }
    if (filter.status) {
      integrations = integrations.filter(i => i.status === filter.status);
    }

    return integrations;
  }

  getConnections(filter = {}) {
    let connections = Array.from(this.connections.values());

    if (filter.integrationId) {
      connections = connections.filter(
        c => c.integrationId === filter.integrationId
      );
    }
    if (filter.status) {
      connections = connections.filter(c => c.status === filter.status);
    }

    return connections;
  }

  getTransformers() {
    return Array.from(this.transformers.keys());
  }

  getWebhooks() {
    return Array.from(this.webhooks.values());
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const automationIntegration = new AutomationIntegrationService(); 