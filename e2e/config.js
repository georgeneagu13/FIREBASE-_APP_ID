import { device, element, by, expect } from 'detox';

const config = {
  setup() {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        permissions: {
          notifications: 'YES',
          camera: 'YES',
          photos: 'YES',
        },
      });
    });

    beforeEach(async () => {
      await device.reloadReactNative();
    });

    afterAll(async () => {
      await device.terminateApp();
    });
  },

  utils: {
    async login(email, password) {
      await element(by.id('email-input')).typeText(email);
      await element(by.id('password-input')).typeText(password);
      await element(by.id('login-button')).tap();
      await expect(element(by.id('home-screen'))).toBeVisible();
    },

    async logout() {
      await element(by.id('settings-tab')).tap();
      await element(by.id('logout-button')).tap();
      await expect(element(by.id('login-screen'))).toBeVisible();
    },

    async clearState() {
      await device.clearKeychain();
      await device.uninstallApp();
      await device.installApp();
    },
  },
};

export default config; 