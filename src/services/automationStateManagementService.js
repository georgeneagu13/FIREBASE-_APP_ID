import { enhancedAnalytics } from './enhancedAnalyticsService';
import { automationScheduling } from './automationSchedulingService';

class AutomationStateManagementService {
  constructor() {
    this.states = new Map();
    this.transitions = new Map();
    this.history = [];
    this.maxHistory = 1000;
    this.listeners = new Map();
    this.config = {
      maxTransitions: 100,
      historyRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
      autoCleanup: true,
      validateTransitions: true,
    };
  }

  async init() {
    try {
      // Register default states
      this.registerDefaultStates();

      // Register default transitions
      this.registerDefaultTransitions();

      // Start cleanup job if enabled
      if (this.config.autoCleanup) {
        this.startCleanupJob();
      }

    } catch (error) {
      console.error('State management init error:', error);
      throw error;
    }
  }

  registerDefaultStates() {
    // Basic automation states
    this.registerState('created', {
      description: 'Automation has been created',
      initial: true,
    });

    this.registerState('scheduled', {
      description: 'Automation is scheduled for execution',
    });

    this.registerState('queued', {
      description: 'Automation is in execution queue',
    });

    this.registerState('running', {
      description: 'Automation is currently running',
    });

    this.registerState('completed', {
      description: 'Automation has completed successfully',
      final: true,
    });

    this.registerState('failed', {
      description: 'Automation has failed',
      final: true,
    });

    this.registerState('paused', {
      description: 'Automation is temporarily paused',
    });

    this.registerState('cancelled', {
      description: 'Automation has been cancelled',
      final: true,
    });
  }

  registerDefaultTransitions() {
    // Define allowed state transitions
    this.registerTransition('created', 'scheduled');
    this.registerTransition('created', 'queued');
    this.registerTransition('scheduled', 'queued');
    this.registerTransition('queued', 'running');
    this.registerTransition('running', 'completed');
    this.registerTransition('running', 'failed');
    this.registerTransition('running', 'paused');
    this.registerTransition('paused', 'running');
    this.registerTransition('paused', 'cancelled');
    this.registerTransition('queued', 'cancelled');
    this.registerTransition('scheduled', 'cancelled');
  }

  registerState(state, config = {}) {
    this.states.set(state, {
      name: state,
      ...config,
      transitions: new Set(),
    });
  }

  registerTransition(fromState, toState, validator) {
    const state = this.states.get(fromState);
    if (state) {
      state.transitions.add(toState);
      if (validator) {
        this.transitions.set(`${fromState}->${toState}`, validator);
      }
    }
  }

  async updateState(automationId, newState, context = {}) {
    try {
      const currentState = await this.getState(automationId);
      
      // Validate transition
      if (this.config.validateTransitions) {
        await this.validateTransition(currentState, newState, context);
      }

      // Update state
      const stateUpdate = {
        automationId,
        previousState: currentState,
        currentState: newState,
        context,
        timestamp: Date.now(),
      };

      // Store state
      await this.setState(automationId, stateUpdate);

      // Notify listeners
      await this.notifyStateChange(stateUpdate);

      // Update history
      this.updateHistory(stateUpdate);

      // Log state change
      await this.logStateChange(stateUpdate);

      return stateUpdate;

    } catch (error) {
      console.error('Update state error:', error);
      throw error;
    }
  }

  async validateTransition(fromState, toState, context) {
    // Check if transition is allowed
    const state = this.states.get(fromState);
    if (!state || !state.transitions.has(toState)) {
      throw new Error(
        `Invalid state transition: ${fromState} -> ${toState}`
      );
    }

    // Check custom validator if exists
    const validator = this.transitions.get(`${fromState}->${toState}`);
    if (validator) {
      await validator(context);
    }
  }

  async setState(automationId, stateUpdate) {
    this.states.set(automationId, stateUpdate);
  }

  async getState(automationId) {
    const state = this.states.get(automationId);
    return state ? state.currentState : 'created';
  }

  registerStateChangeListener(listener) {
    const id = Date.now().toString();
    this.listeners.set(id, listener);
    return id;
  }

  removeStateChangeListener(id) {
    return this.listeners.delete(id);
  }

  async notifyStateChange(stateUpdate) {
    const promises = Array.from(this.listeners.values())
      .map(listener => listener(stateUpdate));
    
    await Promise.all(promises);
  }

  updateHistory(stateUpdate) {
    this.history.unshift(stateUpdate);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
  }

  startCleanupJob() {
    setInterval(() => this.cleanup(), 86400000); // Run daily
  }

  async cleanup() {
    try {
      const cutoff = Date.now() - this.config.historyRetention;
      
      // Clean up history
      this.history = this.history.filter(
        update => update.timestamp >= cutoff
      );

      // Clean up states for completed automations
      for (const [automationId, state] of this.states.entries()) {
        if (
          state.timestamp < cutoff &&
          this.states.get(state.currentState)?.final
        ) {
          this.states.delete(automationId);
        }
      }

    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async logStateChange(stateUpdate) {
    try {
      await enhancedAnalytics.logEvent('state_changed', {
        automationId: stateUpdate.automationId,
        previousState: stateUpdate.previousState,
        currentState: stateUpdate.currentState,
        timestamp: stateUpdate.timestamp,
      });
    } catch (error) {
      console.error('Log state change error:', error);
    }
  }

  getStates() {
    return Array.from(this.states.entries());
  }

  getTransitions() {
    return Array.from(this.transitions.entries());
  }

  getHistory(filter = {}) {
    let history = [...this.history];

    if (filter.automationId) {
      history = history.filter(
        h => h.automationId === filter.automationId
      );
    }
    if (filter.state) {
      history = history.filter(
        h => h.currentState === filter.state
      );
    }
    if (filter.startDate) {
      history = history.filter(
        h => h.timestamp >= filter.startDate
      );
    }
    if (filter.endDate) {
      history = history.filter(
        h => h.timestamp <= filter.endDate
      );
    }

    return history;
  }

  getStateConfig(state) {
    return this.states.get(state);
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const automationStateManagement = new AutomationStateManagementService(); 