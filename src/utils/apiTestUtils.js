import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { API_URL } from '../config';

class APITestUtils {
  constructor() {
    this.mock = new MockAdapter(axios);
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
    };
    this.responseDelay = 100; // Default delay for responses
  }

  // Setup mock responses
  setupMocks(mocks = []) {
    mocks.forEach(({ method, path, response, status = 200, headers = {} }) => {
      const fullPath = `${API_URL}${path}`;
      
      switch (method.toLowerCase()) {
        case 'get':
          this.mock.onGet(fullPath).reply(status, response, headers);
          break;
        case 'post':
          this.mock.onPost(fullPath).reply(status, response, headers);
          break;
        case 'put':
          this.mock.onPut(fullPath).reply(status, response, headers);
          break;
        case 'delete':
          this.mock.onDelete(fullPath).reply(status, response, headers);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    });
  }

  // Reset all mocks
  reset() {
    this.mock.reset();
  }

  // Restore original axios instance
  restore() {
    this.mock.restore();
  }

  // Create mock response with delay
  createResponse(data, status = 200, delay = this.responseDelay) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([status, data]);
      }, delay);
    });
  }

  // Create error response
  createError(status, message, code = 'ERROR') {
    return [
      status,
      {
        error: {
          message,
          code,
        },
      },
    ];
  }

  // Mock API endpoints
  mockEndpoints() {
    return {
      auth: {
        login: (response = { token: 'test-token' }) => {
          this.mock
            .onPost(`${API_URL}/auth/login`)
            .reply(200, response);
        },
        logout: () => {
          this.mock
            .onPost(`${API_URL}/auth/logout`)
            .reply(200, { success: true });
        },
      },
      users: {
        getProfile: (response = { id: 1, name: 'Test User' }) => {
          this.mock
            .onGet(`${API_URL}/users/profile`)
            .reply(200, response);
        },
        updateProfile: () => {
          this.mock
            .onPut(`${API_URL}/users/profile`)
            .reply(200, { success: true });
        },
      },
      // Add more endpoint mocks as needed
    };
  }

  // Verify API calls
  verifyApiCalls() {
    return {
      getHistory: () => this.mock.history,
      getLastCall: (method) => {
        const history = this.mock.history[method.toLowerCase()];
        return history[history.length - 1];
      },
      countCalls: (method) => {
        return this.mock.history[method.toLowerCase()].length;
      },
    };
  }

  // Helper to match request body
  matchRequestBody(expectedBody) {
    return (config) => {
      const requestBody = JSON.parse(config.data);
      return JSON.stringify(requestBody) === JSON.stringify(expectedBody);
    };
  }

  // Helper to match request headers
  matchRequestHeaders(expectedHeaders) {
    return (config) => {
      return Object.entries(expectedHeaders).every(
        ([key, value]) => config.headers[key] === value
      );
    };
  }
}

export default new APITestUtils(); 