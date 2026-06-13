import {test, expect} from './test-base';

test.use({ storageState: '.storage-state/customer.json' });

test.describe('Customer Order Tests', () => {

    test.beforeEach(async ({ customerOrderPage }) => {
        await customerOrderPage.navigate();
    });
    
    test('Customer can view his orders', async ({ customerOrderPage }) => {
        
        await expect(customerOrderPage.page).toHaveURL('/customer/orders');
        const orders = customerOrderPage.actualOrders;
        const noOrdersMessage = customerOrderPage.noOrdersMessage;
        if (await orders.count() > 0) {
            await expect(orders.first()).toBeVisible();
        } else {
            await expect(noOrdersMessage).toBeVisible();
        }

    });

});