import { device, element, by } from 'detox';
import { takeScreenshot, compareScreenshots } from './visualTestUtils';

describe('Visual Regression Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should match login screen snapshot', async () => {
    await element(by.id('login-screen')).tap();
    
    const screenshot = await takeScreenshot('login-screen');
    expect(await compareScreenshots(screenshot, 'login-screen-baseline')).toBeTruthy();
  });

  it('should match home screen snapshot', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    const screenshot = await takeScreenshot('home-screen');
    expect(await compareScreenshots(screenshot, 'home-screen-baseline')).toBeTruthy();
  });

  it('should match dark mode snapshots', async () => {
    await element(by.id('settings-button')).tap();
    await element(by.id('theme-toggle')).tap();
    
    const screenshot = await takeScreenshot('dark-mode-screen');
    expect(await compareScreenshots(screenshot, 'dark-mode-baseline')).toBeTruthy();
  });
}); 