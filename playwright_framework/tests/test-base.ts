import {APIRequestContext, APIResponse, test as base, BrowserContext, expect, Page} from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { LandingPage } from '../pages/landingPage';
import { CustomerOrderPage } from '../pages/customerOrderPage';
import { CustomerCartPage } from '../pages/customerCartPage';
import { CustomerHomePage } from '../pages/customerHomePage';
import { AdminAddProductPage } from '../pages/adminAddProductPage';
import { generateFakeProduct } from '../utils/productFactory';
import { ProductDataAPI } from '../utils/productFactory';
import { generateFakeUser } from '../utils/userFactory';
import { userProfilePage } from '../pages/userProfilePage';


type MyFixtures = {

  loginPage: LoginPage;
  landingPage: LandingPage;
  
  customerOrderPage: CustomerOrderPage;
  customerCartPage: CustomerCartPage;
  customerHomePage: CustomerHomePage;
  customerProfilePage: userProfilePage;

  itemsCount: number;
  itemQuantity: number;

  customerCartPageWithItemsUI: { customerCartPage: CustomerCartPage; products: ProductDataAPI[] };
  customerCartPageWithItemsAPI: { customerCartPage: CustomerCartPage; products: ProductDataAPI[] };

  adminPage: Page;
  adminAddProductPage: AdminAddProductPage;

  adminRequest: APIRequestContext;
  adminAddProductAPI: { responses: APIResponse[]; products: ProductDataAPI[], productIds: string[] };

  isolatedCustomerContext: {context: BrowserContext; page: Page; isolatedRequest: APIRequestContext };

};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await use(landingPage);
  },

  customerOrderPage: async ({ isolatedCustomerContext }, use) => {
    const customerOrderPage = new CustomerOrderPage(isolatedCustomerContext.page);
    await use(customerOrderPage);
  },

  customerHomePage: async ({ isolatedCustomerContext }, use) => {
    const customerHomePage = new CustomerHomePage(isolatedCustomerContext.page);
    await use(customerHomePage);
  },

  customerCartPage: async ({ isolatedCustomerContext }, use) => {
    const customerCartPage = new CustomerCartPage(isolatedCustomerContext.page);
    await use(customerCartPage);
  },

  customerProfilePage: async ({ isolatedCustomerContext }, use) => {
    const customerProfilePage = new userProfilePage(isolatedCustomerContext.page);
    await use(customerProfilePage);
  },
  
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.storage-state/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close(); 
  },

  adminAddProductPage: async ({ adminPage }, use) => {
    const adminAddProductPage = new AdminAddProductPage(adminPage);
    await use(adminAddProductPage);
  },

  itemsCount: [1, { option: true }],
  itemQuantity: [1, { option: true }],

  customerCartPageWithItemsUI: async ({ adminAddProductPage, customerHomePage, isolatedCustomerContext, itemsCount }, use) => {

    const generatedProducts: ProductDataAPI[] = [];

    for (let i = 0; i < itemsCount; i++) {
      await adminAddProductPage.navigate();
      const fakeProduct = generateFakeProduct();
      await adminAddProductPage.addProduct(fakeProduct.product_title, fakeProduct.description, fakeProduct.unit_price, fakeProduct.photo, fakeProduct.stock_qty, fakeProduct.supplier_id);
      generatedProducts.push(fakeProduct);
    }

    await customerHomePage.navigate();
    for (const product of generatedProducts) {
      await customerHomePage.addItemToCart(product.product_title);
    }

    const customerCartPage = new CustomerCartPage(isolatedCustomerContext.page);
    await customerCartPage.navigate();
    
    await use({ customerCartPage, products: generatedProducts });
    
    for (let i = 0; i < itemsCount; i++) {
      await customerCartPage.removeItem(generatedProducts[i].product_title);
    }

  },

  adminRequest: async ({ playwright }, use) => {
    const adminAPIContext = await playwright.request.newContext({
      storageState: '.storage-state/admin.json',
    });
    await use(adminAPIContext);
    await adminAPIContext.dispose();
  },

  adminAddProductAPI: async ({ adminRequest, itemsCount }, use) => {
    const products: ProductDataAPI[] = [];
    const responses: APIResponse[] = [];
    const productIds: string[] = [];
    
    for (let i = 0; i < itemsCount; i++) {
        const fakeProduct = generateFakeProduct();
        const response = await adminRequest.post('/admin-dashboard/products', { 
        data: fakeProduct 
      });
      expect(response.ok()).toBeTruthy();
      
      const responseData = await response.json();
      const newProductId = responseData.product.product_id;

      products.push(fakeProduct);
      responses.push(response);
      productIds.push(newProductId);
    }

    await use({ responses, products, productIds });

    for (const productId of productIds) {
      const deleteUserResponse = await adminRequest.delete(`/admin-dashboard/products/${productId}`);
      const isUserDeleted = deleteUserResponse.ok() || deleteUserResponse.status() === 404;
      expect.soft(isUserDeleted, `Failed to delete fake user ID: ${productId}`).toBeTruthy();
    }
  },

  customerCartPageWithItemsAPI: async ({ adminAddProductAPI, isolatedCustomerContext, customerCartPage, itemQuantity }, use) => {
    const { productIds, products } = adminAddProductAPI;

    for (const productId of productIds) {
      const addToCartResponse = await isolatedCustomerContext.isolatedRequest.post('/customer/cart', {
        data: {
          product_id: productId,
          quantity: itemQuantity
        }
      });
      expect(addToCartResponse.ok()).toBeTruthy();
    }
    await customerCartPage.navigate();

    await use({ customerCartPage, products });

    for (const productId of productIds) {
      const removeCartResponse = await isolatedCustomerContext.isolatedRequest.delete(`/customer/cart/${productId}` );
      const isSuccessfulCleanup = removeCartResponse.ok() || removeCartResponse.status() === 404;
      expect.soft(isSuccessfulCleanup).toBeTruthy();
    }

  },

  isolatedCustomerContext: async ({ browser, playwright, adminRequest }, use) => {
    
    const fakeUser = generateFakeUser();
    const setupAPI = await playwright.request.newContext();

    const registerResponse = await setupAPI.post('/auth/register', { data: fakeUser });

    const registerData = await registerResponse.json();
    const newUserId = registerData.user.user_id;

    const loginResponse = await setupAPI.post('/auth/login', { 
        data: { email: fakeUser.email, password: fakeUser.password } 
    });
    
    expect(loginResponse.ok()).toBeTruthy();

    const authState = await setupAPI.storageState();
    await setupAPI.dispose();
    
    const context = await browser.newContext({ storageState: authState });    
    
    const isolatedPage = await context.newPage(); 
    const isolatedRequest = context.request;

    await use({ context: context, page: isolatedPage, isolatedRequest: isolatedRequest });

    await isolatedPage.close();
    await context.close();

    const deleteUserResponse = await adminRequest.delete(`/admin-dashboard/users/${newUserId}`);
    const isUserDeleted = deleteUserResponse.ok() || deleteUserResponse.status() === 404;
    expect.soft(isUserDeleted, `Failed to delete fake user ID: ${newUserId}`).toBeTruthy();
  },
    
});

export { expect } from '@playwright/test';