import {test, expect} from './test-base';
import credentials from '../test-data/credentials.json';
//import { LoginPage } from '../pages/loginPage';

test.describe('Login Tests', () => {

  // let loginPage: LoginPage;

  // test.beforeEach(async ({ page }) => {
  //   loginPage = new LoginPage(page);
  //   await loginPage.navigate();
  // });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('verify that email field exists and is editable', async({loginPage})=>{
    const emailField = loginPage.emailField;
    await expect(emailField).toBeEditable();
  });

  test('verify that password field exists and is editable', async({loginPage})=>{
    const passwordField = loginPage.passwordField;
    await expect(passwordField).toBeEditable();
  });

  test('verify that submit button exists and is enabled', async({loginPage})=>{
    const submitButton = loginPage.submitButton;
    await expect(submitButton).toBeEnabled();
  });

  test('Verify that user can successfully login as Customer with valid credentials.', async ({ loginPage }) => {
    await loginPage.login(credentials.validCustomer.email, credentials.validCustomer.password);
    await expect(loginPage.page).toHaveURL('/customer/');
  });

  test('Verify that user can successfully login as Vendor with valid credentials', async ({ loginPage }) => {
    await loginPage.login(credentials.validVendor.email, credentials.validVendor.password);
    await expect(loginPage.page).toHaveURL('/supplier-dhashboard/view-products');
  });

  test('Verify that user can successfully login as Admin with valid credentials', async ({ loginPage }) => {
    await loginPage.login(credentials.validAdmin.email, credentials.validAdmin.password);
    await expect(loginPage.page).toHaveURL('admin-dashboard/customers');
  });


  test('Verify that validation error appears when Email field is empty.', async ({ loginPage }) => {
    await loginPage.login('', credentials.validCustomer.password);
    const loginError = loginPage.loginError;
    await expect(loginError).toContainText('Email is required');
  });

  test('Verify that validation error appears when Password field is empty', async ({ loginPage }) => {
    await loginPage.login(credentials.validCustomer.email, '');
    const loginError = loginPage.loginError;
    await expect(loginError).toContainText('Password is required');
  });

  test('Verify that validation error appears when both fields are empty', async ({ loginPage }) => {
    await loginPage.login('', '');
    const loginError = loginPage.loginError;
    await expect(loginError).toContainText('Email/Password required');
  });

  test('Verify that invalid credentials are rejected (wrong password)', async ({ loginPage }) => {
    await loginPage.login(credentials.validCustomer.email, 'wrongPassword');
    const loginError = loginPage.loginError;
    await expect(loginError).toContainText('Invalid email or password');
  });

  test('Verify that invalid credentials are rejected (wrong email)', async ({ loginPage }) => {
    await loginPage.login('wrongEmail@example.com', credentials.validCustomer.password);
    const loginError = loginPage.loginError;
    await expect(loginError).toContainText('Invalid email or password');
  });

  test('Verify that invalid credentials are rejected (wrong email and wrong password)', async ({ loginPage }) => {
    await loginPage.login('wrongEmail@example.com', 'wrongPassword');
    const loginError = loginPage.loginError;
    await expect(loginError).toContainText('Invalid email or password');
  });

  test('Verify that Password field is masked by default', async ({ loginPage }) => {
    const passwordField = loginPage.passwordField;
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('Verify that user can show and hide password',async ({loginPage})=>{
    const toggleButton = loginPage.togglePasswordButton;
    await toggleButton.click();
    const passwordField = loginPage.passwordField;
    await expect(passwordField).toHaveAttribute('type', 'text');
    await toggleButton.click();
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('Verify that user can navigate to registration page from login page', async ({ loginPage }) => {
    const registerLink = loginPage.registerLink;
    await registerLink.click();
    await expect(loginPage.page).toHaveURL('/auth/register');
  });

  test('Verify that login is secure (no sensitive data in URL)', async ({ loginPage }) => {
    await loginPage.login(credentials.validCustomer.email, credentials.validCustomer.password);
    const currentURL = loginPage.page.url();
    expect(currentURL).not.toContain('email=');
    expect(currentURL).not.toContain('password=');
  });

});