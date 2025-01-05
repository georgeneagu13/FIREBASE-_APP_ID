describe('FoodAI App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on first launch', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
    await expect(element(by.text('Welcome to FoodAI'))).toBeVisible();
  });

  it('should navigate to registration screen', async () => {
    await element(by.text("Don't have an account? Sign Up")).tap();
    await expect(element(by.id('register-screen'))).toBeVisible();
  });

  it('should show home screen after login', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should open camera when scan button is pressed', async () => {
    await element(by.id('scan-button')).tap();
    await expect(element(by.id('camera-screen'))).toBeVisible();
  });
}); 