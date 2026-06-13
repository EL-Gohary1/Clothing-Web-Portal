import {test, expect} from './test-base';


test.describe("Product Display tests", () => {

    test('Verify that products names are displayed', async ({ customerHomePage }) => {
        const count = await customerHomePage.getCardsCount();
        for (let i = 0; i < count; i++) {
            const nameLocator = customerHomePage.getNameLocatorByIndex(i);
            await expect(nameLocator).toBeVisible();
        }
    });

    test('Verify that products images are displayed correctly in the home page ', async ({ customerHomePage }) => {
        const count = await customerHomePage.getCardsCount();
        for (let i = 0; i < count; i++) {
            const imageLocator = customerHomePage.getImageLocatorByIndex(i);        
            await expect(imageLocator).toBeVisible();
            await expect(imageLocator).toHaveAttribute("src");
        }
    });

    test('Verify that products descriptions are displayed correctly in the home page ', async ({ customerHomePage }) => {
        const count = await customerHomePage.getCardsCount();
        for (let i = 0; i < count; i++) {
            const descriptionLocator = customerHomePage.getDescriptionLocatorByIndex(i);
            await expect(descriptionLocator).toBeVisible();
        }

    });

    test('Verify that unit price of the products are displayed correctly in the home page', async ({ customerHomePage }) => {
        const count = await customerHomePage.getCardsCount();
        for (let i = 0; i < count; i++) {
            const priceLocator = customerHomePage.getPriceLocatorByIndex(i);
            await expect(priceLocator).toBeVisible();
        }
    });

    test('Verify that the quantity of the products are displayed correctly in the home page.', async ({ customerHomePage }) => {
        const count = await customerHomePage.getCardsCount();
        for (let i = 0; i < count; i++) {
            const quantityLocator = customerHomePage.getQuantityLocatorByIndex(i);
            await expect(quantityLocator).toBeVisible();
        }
    });

    test('Verify that availability status of the products are displayed correctly in the home page.', async ({ customerHomePage }) => {
        const count = await customerHomePage.getCardsCount();
        for (let i = 0; i < count; i++) {
            const stockStatusLocator = customerHomePage.getStockStatusLocatorByIndex(i);
            await expect(stockStatusLocator).toBeVisible();
        }
    });

    test('Verify quantity selector UI elements are displayed correctly in the home page.', async ({ customerHomePage }) => {
        const count = await customerHomePage.getCardsCount();
        for (let i = 0; i < count; i++) {
            const increaseQuantityButton = customerHomePage.getIncreaseQuantityButtonByIndex(i);
            const decreaseQuantityButton = customerHomePage.getDecreaseQuantityButtonByIndex(i);
            await expect(increaseQuantityButton).toBeVisible();
            await expect(decreaseQuantityButton).toBeVisible();
        }
    });

    test('Verify minimum quantity limit (cannot go below 1)', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        for (const title of cardTitles) {
            const initialQuantity = await customerHomePage.getQuantityByName(title);
            expect(initialQuantity).toBe(1); 
            await customerHomePage.clickDecreaseQuantityByName(title);
            const updatedQuantity = await customerHomePage.getQuantityByName(title);
            expect(updatedQuantity).toBe(1); 
        }   
    });

    test('Verify maximum stock limit for quantity selector', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        for (const title of cardTitles) {
            const initialQuantity = await customerHomePage.getQuantityByName(title);
            const stockQuantity = await customerHomePage.getStockQuantityByName(title);
            
            if (initialQuantity === null || stockQuantity === undefined) {
                throw new Error(`Missing quantity data for product: ${title}`);
            }
            for (let i = 1; i < stockQuantity; i++) {
                await customerHomePage.clickIncreaseQuantityByName(title);
                const updatedQuantity = await customerHomePage.getQuantityByName(title);
                expect(updatedQuantity).toBe(initialQuantity + i);
            }
            await customerHomePage.clickIncreaseQuantityByName(title);
            const finalQuantity = await customerHomePage.getQuantityByName(title);
            expect(finalQuantity).toBe(stockQuantity); 
        }

    });

    test('Verify UI elements for the Add to Cart button of the products are displayed for In Stock product', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        for (const title of cardTitles) {
            const addToCartButton = customerHomePage.getAddToCartButtonByName(title);
            await expect(addToCartButton).toBeVisible();
        }

    });

    test('Verify Add to Cart button is enabled for in-stock products', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        for (const title of cardTitles) {
            const addToCartButton = customerHomePage.getAddToCartButtonByName(title);
            await expect(addToCartButton).toBeEnabled();
        }

    });

    test('Verify Add to Cart button is disappeared when product is Out of Stock', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesOutOfStock();
        for (const title of cardTitles) {
            const addToCartButton = customerHomePage.getAddToCartButtonByName(title);
            await expect(addToCartButton).toBeHidden();
        }
    });

    test('Verify UI elements for the supplier email of the products are displayed', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        for (const title of cardTitles) {
            const supplierEmailLocator =  customerHomePage.getSupplierEmailLocatorByName(title); 
            await expect(supplierEmailLocator).toBeVisible();
        }

        const outOfStockCardTitles = await customerHomePage.getCardTitlesOutOfStock();
        for (const title of outOfStockCardTitles) {
            const supplierEmailLocator =  customerHomePage.getSupplierEmailLocatorByName(title); 
            await expect(supplierEmailLocator).toBeVisible();
        }
    });

    test('Verify In Stock status shows green color', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        for (const title of cardTitles) {
            const stockStatusLocator = customerHomePage.getStockStatusLocatorByName(title);
            await expect(stockStatusLocator).toHaveCSS("color", "rgb(0, 128, 0)");
        }

    });

    test('Verify Out of Stock status shows red color.', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesOutOfStock();
        for (const title of cardTitles) {
            const stockStatusLocator = customerHomePage.getStockStatusLocatorByName(title);
            await expect(stockStatusLocator).toHaveCSS("color", "rgb(255, 0, 0)");
        }
    });

    test('Verify Add to Cart button adds product to cart with alert containing added to cart message', async ({ customerHomePage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        const message = await customerHomePage.addItemToCart(cardTitles[0]);
        expect(message).toContain("added to cart");        
        
    });

    test('Verify Add to Cart button adds product to cart with selected quantity', async ({ customerHomePage, customerCartPage }) => {
        const cardTitles = await customerHomePage.getCardTitlesInStock();
        const initialQuantity = await customerHomePage.getQuantityByName(cardTitles[0]);
        expect(initialQuantity).toBe(1);
        if (initialQuantity === null) {
            throw new Error(`Missing quantity data for product: ${cardTitles[0]}`);
        }
        await customerHomePage.clickIncreaseQuantityByName(cardTitles[0]);
        const updatedQuantity = await customerHomePage.getQuantityByName(cardTitles[0]);
        expect(updatedQuantity).toBe(initialQuantity + 1);
        await customerHomePage.addItemToCart(cardTitles[0]);
        customerHomePage.clickCart();
        const cartItems = await customerCartPage.getItemsNames();
        expect(cartItems).toContain(cardTitles[0]);
        const quantityInCart = await customerCartPage.getItemQuantity(cardTitles[0]); 
        expect(quantityInCart).toBe(updatedQuantity);
    });

    test('Verify Search bar is visible and editable', async ({ customerHomePage }) => {
        await expect(customerHomePage.getSearchBar()).toBeVisible();
        await expect(customerHomePage.getSearchBar()).toBeEditable();
    });

    test('Verify Search button is visible and clickable', async ({ customerHomePage }) => {
        await expect(customerHomePage.getSearchButton()).toBeAttached();
        await expect(customerHomePage.getSearchButton()).toBeVisible();
        await expect(customerHomePage.getSearchButton()).toBeEnabled();
    });

    test('Verify Search returns relevant products', async ({ customerHomePage }) => {
        const availableProducts = await customerHomePage.getCardTitlesInStock();
        const searchKeyword = availableProducts[0];
        await customerHomePage.getSearchBar().fill(searchKeyword);
        await customerHomePage.getSearchButton().click();
        const count = await customerHomePage.getCardsCount();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const productNameLocator = customerHomePage.getNameLocatorByIndex(i);        
            const productNameText = await productNameLocator.textContent();
            expect(productNameText?.toLowerCase()).toContain(searchKeyword.toLowerCase());
        }

    });

    test('Verify Search does nothing when search bar is empty', async ({ customerHomePage }) => {
        const initialCount = await customerHomePage.getCardsCount();
        await customerHomePage.getSearchBar().fill("");
        await customerHomePage.getSearchButton().click();
        const finalCount = await customerHomePage.getCardsCount();
        expect(finalCount).toBe(initialCount);

    });

    test('Verify Search shows no results message for non-matching product name', async ({ customerHomePage }) => {
        const invalidProductName = "InvalidProduct123XYZ";
        await customerHomePage.getSearchBar().fill(invalidProductName);
        await customerHomePage.getSearchButton().click();

        const count = await customerHomePage.getCardsCount();
        expect(count).toBe(0);

        const noResultMessageLocator = customerHomePage.getNoResultsMessage();
        
        await expect(noResultMessageLocator).toBeVisible();
        await expect(noResultMessageLocator).toHaveText('No products found!');
    });
    
});