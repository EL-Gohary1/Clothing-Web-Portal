import { generateFakeProduct } from '../utils/productFactory';
import {test, expect} from './test-base';


test.describe("Shopping Cart Functionality", () => {

    // We exclude navigate() from the base fixture to avoid breaking the natural UI flow in E2E tests. 
    // Forcing navigation would cause redundant page reloads and introduce test flakiness.
    
    test("Verify that a registered user can access the shopping cart page", async ({ customerCartPage }) => {
        await customerCartPage.navigate();
        await expect(customerCartPage.page).toHaveURL('/customer/cart');  
    });

    test('Verify that products names are displayed correctly in the cart after adding items via UI', async ({ customerCartPageWithItemsUI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsUI;
        await customerCartPage.navigate();
        const productNames = await customerCartPage.getItemsNames();
        expect(productNames).toContain(products[0].product_title);
    });

    test('Verify that products names are displayed correctly in the cart after adding items via API', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const productNames = await customerCartPage.getItemsNames();
        expect(productNames).toContain(products[0].product_title);
    });

    test('Verify that unit price of the products are displayed correctly in the cart', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const productPrice = await customerCartPage.getItemPrice(products[0].product_title);
        expect(productPrice).toBe(parseFloat(products[0].unit_price));
    });

    test('Verify that the quantity of the products are displayed correctly in the cart.', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const totalQuantity = await customerCartPage.getItemQuantity(products[0].product_title);
        expect(totalQuantity).toBe(1);
    });

    test('Verify subtotal price calculation for each product', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const itemSubtotalPrice = await customerCartPage.getItemTotalPrice(products[0].product_title);
        expect(itemSubtotalPrice).toBe(parseFloat(products[0].unit_price)*1);
    });

    test('Verify Total Price Calculation (subtotal + shipping)', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const totalPrice = await customerCartPage.getTotalPrice();
        const expectedTotalPrice = parseFloat(products[0].unit_price)*1 + 50; 
        expect(totalPrice).toBe(expectedTotalPrice);
    });

    test('Verify that adding the same product multiple times increases its quantity in the cart', async ({ adminAddProductPage, customerHomePage, customerCartPage  }) => {
        await adminAddProductPage.navigate();
        const fakeProduct = generateFakeProduct();
        await adminAddProductPage.addProduct(fakeProduct.product_title, fakeProduct.description, fakeProduct.unit_price, fakeProduct.photo, fakeProduct.stock_qty, fakeProduct.supplier_id);
        await customerHomePage.navigate();
        await customerHomePage.addItemToCart(fakeProduct.product_title);
        await customerCartPage.navigate();
        const totalQuantity = await customerCartPage.getItemQuantity(fakeProduct.product_title);
        expect(totalQuantity).toBe(1);
        await customerHomePage.navigate();
        await customerHomePage.addItemToCart(fakeProduct.product_title);
        await customerCartPage.navigate();
        const updatedTotalQuantity = await customerCartPage.getItemQuantity(fakeProduct.product_title);
        expect(updatedTotalQuantity).toBe(2);
        await customerCartPage.removeItem(fakeProduct.product_title);
    });


    test('Verify minimum quantity limit (cannot go below 1)', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const totalQuantity = await customerCartPage.getItemQuantity(products[0].product_title);
        expect(totalQuantity).toBe(1); 
        await customerCartPage.decreaseItemQuantity(products[0].product_title);
        const updatedTotalQuantity = await customerCartPage.getItemQuantity(products[0].product_title);
        expect(updatedTotalQuantity).toBe(1); 
    });

    test('Verify Maximum Stock Limit for Order Quantity on Cart page', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const stockQty = parseInt(products[0].stock_qty);
        for(let i=1; i<stockQty; i++) {
            await customerCartPage.increaseItemQuantity(products[0].product_title);
        }   
        const totalQuantity = await customerCartPage.getItemQuantity(products[0].product_title);
        expect(totalQuantity).toBe(stockQty); 
        await customerCartPage.increaseItemQuantity(products[0].product_title);
        const updatedTotalQuantity = await customerCartPage.getItemQuantity(products[0].product_title);
        expect(updatedTotalQuantity).toBe(stockQty);    
    });

    test('Verify that clicking the trash icon removes the item from the cart', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage, products } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        await customerCartPage.removeItem(products[0].product_title);
        const productNames = await customerCartPage.getItemsNames();
        expect(productNames).not.toContain(products[0].product_title);
    });

    test('Verify Checkout button is clickable on the shopping cart page after added product', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        const isCheckoutButtonEnabled = await customerCartPage.checkoutButton.isEnabled();
        expect(isCheckoutButtonEnabled).toBe(true);
    });

    test('Verify that the checkout Button is disabled when the cart is empty  ', async ({ customerCartPage }) => {
        await customerCartPage.navigate();
        const isCheckoutButtonEnabled = await customerCartPage.checkoutButton.isEnabled();
        expect(isCheckoutButtonEnabled).toBe(false);
    });


    test('Verify that the checkout Button redirects user to checkout page', async ({ customerCartPageWithItemsAPI }) => {
        const { customerCartPage } = customerCartPageWithItemsAPI;
        await customerCartPage.navigate();
        await customerCartPage.checkoutButton.click();
        await expect(customerCartPage.page).toHaveURL('/customer/checkout');  
    });

    test('Verify that the Home Button redirects user to home page', async ({ customerCartPage }) => {
        await customerCartPage.navigate();
        await customerCartPage.homeButton.click();
        await expect(customerCartPage.page).toHaveURL('/customer/home');
    });

    test('Verify that Home button is visible on Cart page', async ({ customerCartPage }) => {
        await customerCartPage.navigate();
        const isHomeButtonVisible = await customerCartPage.homeButton.isVisible();
        expect(isHomeButtonVisible).toBe(true); 
    });
    
});

test.describe("Shopping Cart Functionality 2", () => {

    test.use({ itemsCount: 2 });
    test('Verify that total price updates automatically after removal', async ({ customerCartPageWithItemsAPI }) => {
            const { customerCartPage, products } = customerCartPageWithItemsAPI;
            await customerCartPage.navigate();
            const initialTotalPrice = await customerCartPage.getTotalPrice();
            const expectedInitialTotalPrice = parseFloat(products[0].unit_price)*1 + parseFloat(products[1].unit_price)*1 + 50; 
            expect(initialTotalPrice).toBe(expectedInitialTotalPrice);
            await customerCartPage.removeItem(products[0].product_title);
            const updatedTotalPrice = await customerCartPage.getTotalPrice();
            const expectedUpdatedTotalPrice = parseFloat(products[1].unit_price)*1 + 50; 
            expect(updatedTotalPrice).toBe(expectedUpdatedTotalPrice);
        });
});        