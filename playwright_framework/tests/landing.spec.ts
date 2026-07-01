import {test, expect} from './test-base';


test.describe('Landing Tests', () => {


  test.beforeEach(async ({ landingPage }) => {
    await landingPage.navigate();
  });

  test('Verify Login & Sign-up presence', async({landingPage}) => {
    await expect(landingPage.loginButton).toBeVisible();
    await expect(landingPage.registerButton).toBeVisible();
  });

  test('Verify Sign-up Navigation', async({landingPage}) => {
    await landingPage.clickRegister();
    await expect(landingPage.page).toHaveURL('/auth/register');
  });

  test('Verify Login Navigation', async({landingPage}) => {
    await landingPage.clickLogin();
    await expect(landingPage.page).toHaveURL('/auth/login');
  });

  test('verify Add to Cart button shows a alert error message "Please login to add items to cart', async({landingPage}) => {
    const dialogPromise = landingPage.page.waitForEvent('dialog');
    const cardTitles = await landingPage.getCardTitlesInStock();
    await landingPage.addItemToCart(cardTitles[0]);
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Please login to add items to cart');
    await dialog.accept(); 
  });

  test('Verify Home button redirect to login page when user is logged out', async ({ landingPage }) => {
    await landingPage.clickHome();
    await expect(landingPage.page).toHaveURL('/auth/login');
  });

  test('Verify Cart button redirect to login page when user is logged out', async ({ landingPage }) => {
    await landingPage.clickCart();
    await expect(landingPage.page).toHaveURL('/auth/login');
  });

  test('Verify Orders button redirect to login page when user is logged out', async ({ landingPage }) => {
    await landingPage.clickOrders();
    await expect(landingPage.page).toHaveURL('/auth/login');
  });

});