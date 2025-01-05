import apiTestUtils from '../../utils/apiTestUtils';
import { API_URL } from '../../config';
import authService from '../../services/authService';
import userService from '../../services/userService';

describe('API Integration Tests', () => {
  beforeEach(() => {
    apiTestUtils.reset();
  });

  afterAll(() => {
    apiTestUtils.restore();
  });

  describe('Authentication', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthResponse = {
      token: 'test-token',
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    it('should successfully login', async () => {
      apiTestUtils.setupMocks([
        {
          method: 'POST',
          path: '/auth/login',
          response: mockAuthResponse,
        },
      ]);

      const response = await authService.login(mockCredentials);
      expect(response).toEqual(mockAuthResponse);

      const lastCall = apiTestUtils.verifyApiCalls().getLastCall('post');
      expect(lastCall.url).toBe(`${API_URL}/auth/login`);
      expect(JSON.parse(lastCall.data)).toEqual(mockCredentials);
    });

    it('should handle login failure', async () => {
      apiTestUtils.setupMocks([
        {
          method: 'POST',
          path: '/auth/login',
          status: 401,
          response: {
            error: {
              message: 'Invalid credentials',
              code: 'AUTH_FAILED',
            },
          },
        },
      ]);

      await expect(authService.login(mockCredentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('User Profile', () => {
    const mockProfile = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg',
    };

    beforeEach(() => {
      // Mock authentication token
      jest.spyOn(authService, 'getToken').mockResolvedValue('test-token');
    });

    it('should fetch user profile', async () => {
      apiTestUtils.setupMocks([
        {
          method: 'GET',
          path: '/users/profile',
          response: mockProfile,
        },
      ]);

      const profile = await userService.getProfile();
      expect(profile).toEqual(mockProfile);

      const lastCall = apiTestUtils.verifyApiCalls().getLastCall('get');
      expect(lastCall.headers.Authorization).toBe('Bearer test-token');
    });

    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        avatar: 'new-avatar.jpg',
      };

      apiTestUtils.setupMocks([
        {
          method: 'PUT',
          path: '/users/profile',
          response: { ...mockProfile, ...updateData },
        },
      ]);

      const updatedProfile = await userService.updateProfile(updateData);
      expect(updatedProfile.name).toBe(updateData.name);

      const lastCall = apiTestUtils.verifyApiCalls().getLastCall('put');
      expect(JSON.parse(lastCall.data)).toEqual(updateData);
    });
  });

  // Add more test suites as needed
}); 