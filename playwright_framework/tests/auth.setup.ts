import {test as setup, expect} from './test-base';
import credentials from '../test-data/credentials.json';


setup.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

setup('Auth Setup as customer', async ({loginPage}) => {
    await loginPage.login(credentials.validCustomer.email, credentials.validCustomer.password);
    await expect(loginPage.page.frameLocator('.nav-frame').getByRole('link', { name: 'Profile' })).toBeVisible();
    await loginPage.page.context().storageState({ path: '.storage-state/customer.json' });
});

setup('Auth Setup as vendor', async ({loginPage}) => {
    await loginPage.login(credentials.validVendor.email, credentials.validVendor.password);
    await expect(loginPage.page.getByRole('link', { name: 'Profile' })).toBeVisible();
    await loginPage.page.context().storageState({ path: '.storage-state/vendor.json' });
});

setup('Auth Setup as admin', async ({loginPage}) => {
    await loginPage.login(credentials.validAdmin.email, credentials.validAdmin.password);
    await expect(loginPage.page.getByRole('link', { name: 'Profile' })).toBeVisible();
    await loginPage.page.context().storageState({ path: '.storage-state/admin.json' });
});

