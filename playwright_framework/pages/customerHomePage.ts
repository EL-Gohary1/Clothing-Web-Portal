import { Page, Locator } from "@playwright/test";


export class CustomerHomePage {

    readonly page: Page;
    readonly url: string;
    readonly profileButton: Locator;
    readonly homeButton: Locator;
    readonly cartButton: Locator;
    readonly orderButton: Locator;
    readonly cards: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.url = "/customer/";
        this.profileButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Profile" });
        this.homeButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Home" });
        this.cartButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Cart" });
        this.orderButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Orders" });
        this.cards = page.locator(".card");
    }

    async navigate() {
        await this.page.goto(this.url);
    }

    async clickProfile() {
        await this.profileButton.click();
    }
    
    async clickHome() {
        await this.homeButton.click();
    }   

    async clickCart() {
        await this.cartButton.click();
    }   

    async clickOrders() {
        await this.orderButton.click();
    }

    async getCardsCount() {
        return await this.cards.count();
    }

    async getCardTitlesInStock() {
        const count = await this.getCardsCount();
        const titles = [];  
        for (let i = 0; i < count; i++) {
            if (await this.cards.nth(i).locator(".stock-status-text:has-text('In Stock')").isVisible()) {
                const title = await this.cards.nth(i).locator(".name").textContent();
                if (title) {
                titles.push(title.trim());
                } 
            }
        }
        return titles;
    }

    async getCardTitlesOutOfStock() {
        const count = await this.getCardsCount();
        const titles = [];  
        for (let i = 0; i < count; i++) {
            if (await this.cards.nth(i).locator(".stock-status-text:has-text('Out of Stock')").isVisible()) {
                const title = await this.cards.nth(i).locator(".name").textContent();
                if (title) {
                titles.push(title.trim());
                } 
            }
        }
        return titles;
    }


    async addItemToCart(itemName: string) {
        const dialogPromise = this.page.waitForEvent('dialog');
        const card =  this.cards.filter({ hasText: itemName });
        await card.getByRole("button", { name: "Add to Cart" }).click();
        const dialog = await dialogPromise;
        const message = dialog.message();
        await dialog.accept();        
        return message;
    }

    

    async getDescriptionByName(itemName: string) {
        const card =  this.cards.filter({ hasText: itemName });
        return await card.locator(".desc").textContent();
    }

    async getPriceByName(itemName: string) {
        const card =  this.cards.filter({ hasText: itemName });
        return await card.locator(".price").textContent();
    }

    async getStockStatusByName(itemName: string) {
        const card =  this.cards.filter({ hasText: itemName });
        return await card.locator(".stock-status-text").textContent();
    }

    async getStockQuantityByName(itemName: string) {
        const card =  this.cards.filter({ hasText: itemName });
        const stockText = await card.locator("span:has-text('Stock:')").textContent();
        if (stockText) {
            const match = stockText.match(/Stock:\s*(\d+)/);
            if (match) {
                return parseInt(match[1]);
            }
        }
    }

    async getQuantityByName(itemName: string) {
        const card =  this.cards.filter({ hasText: itemName });
        const quantityText = await card.locator(".qty-val").textContent();
        return quantityText ? parseInt(quantityText) : null;
    }

    async getNameByIndex(index: number) {
        const card = this.cards.nth(index);
        return await card.locator(".name").textContent();
    }

    getNameLocatorByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.locator(".name");
    }

    getImageLocatorByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.getByRole("img");
    }

    getDescriptionLocatorByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.locator(".desc");
    }

    getPriceLocatorByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.locator(".price");
    }

    getStockStatusLocatorByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.locator(".stock-status-text");
    }

    getStockStatusLocatorByName(itemName: string) {
        const card = this.cards.filter({ hasText: itemName });
        return card.locator(".stock-status-text");
    }

    getQuantityLocatorByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.locator(".qty-val");
    }

    getAddToCartButtonByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.getByRole("button", { name: "Add to Cart" });
    }

    getAddToCartButtonByName(itemName: string) {
        const card = this.cards.filter({ hasText: itemName });
        return card.getByRole("button", { name: "Add to Cart" });
    }

    getIncreaseQuantityButtonByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.getByRole("button", { name: "+" });
    }

    getDecreaseQuantityButtonByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.getByRole("button", { name: "-" });
    }

    getSupplierEmailByIndex(index: number) {
        const card = this.cards.nth(index);
        return card.locator(".supplier-label").textContent();
    }

    getSupplierEmailLocatorByName(itemName: string) {
        const card = this.cards.filter({ hasText: itemName });
        return card.locator(".supplier-label");
    }

    clickIncreaseQuantityByName(itemName: string) {
        const card =  this.cards.filter({ hasText: itemName });
        return card.getByRole("button", { name: "+" }).click();
    }

    clickDecreaseQuantityByName(itemName: string) {
        const card =  this.cards.filter({ hasText: itemName });
        return card.getByRole("button", { name: "-" }).click();
    }

    getSearchBar() {  
        return this.page.getByPlaceholder("Search for names...");
    }

    getSearchButton() {
        return this.page.getByRole("button", { name: "Search" });
    } 

    getNoResultsMessage() {
        return this.page.locator("#noProductMessage");
    }


    
}