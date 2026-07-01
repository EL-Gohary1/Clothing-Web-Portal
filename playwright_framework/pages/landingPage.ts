import { Page, Locator } from "@playwright/test";


export class LandingPage {

    readonly page: Page;
    readonly url: string;
    readonly loginButton: Locator;
    readonly registerButton: Locator;
    readonly homeButton: Locator;
    readonly cartButton: Locator;
    readonly orderButton: Locator;
    readonly cards: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.url = "/";
        this.loginButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Login" });
        this.registerButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Register" });
        this.homeButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Home" });
        this.cartButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Cart" });
        this.orderButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Orders" });
        this.cards = page.locator(".card");
    }

    async navigate() {
        await this.page.goto(this.url);
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async clickRegister() {
        await this.registerButton.click();
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
            if (await this.cards.nth(i).getByRole("button", { name: "Add to Cart" }).isVisible()) {
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
            if (!(await this.cards.nth(i).getByRole("button", { name: "Add to Cart" }).isVisible())) {
                const title = await this.cards.nth(i).locator(".name").textContent();
                if (title) {
                titles.push(title.trim());
                } 
            }
        }
        return titles;
    }

    async addItemToCart(itemName: string) {
        const card = this.cards.filter({ hasText: itemName });
        await card.getByRole("button", { name: "Add to Cart" }).click();
    }

}