import { device, element, by, expect } from 'detox';
import config from '../config';

describe('Authentication Flow', () => {
  config.setup();

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.id('home-screen'))).toBeVisible();
    await expect(element(by.text('Welcome, Test User'))).toBeVisible();
  });

  it('should show error message with invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrongpass');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should maintain login state after app restart', async () => {
    await config.utils.login('test@example.com', 'password123');
    await device.reloadReactNative();
    
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should logout successfully', async () => {
    await config.utils.login('test@example.com', 'password123');
    await config.utils.logout();
    
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
}); 