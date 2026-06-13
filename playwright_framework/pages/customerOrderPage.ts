import  {Locator, Page} from '@playwright/test';

export class CustomerOrderPage {
    readonly page: Page;
    readonly url: string;
    readonly homeButton: Locator;
    readonly orderButton: Locator;
    readonly cartButton: Locator;
    readonly profileButton: Locator;
    readonly welcomeMessage: Locator;
    readonly actualOrders: Locator;
    readonly noOrdersMessage: Locator;

    
    constructor(page: Page) {
        this.page = page;
        this.url = "customer/orders";
        this.homeButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Home" });
        this.orderButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Orders" });
        this.cartButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Cart" });
        this.profileButton = page.frameLocator(".nav-frame").getByRole("link", { name: "Profile" });
        this.welcomeMessage = page.frameLocator(".nav-frame").locator("//div[contains(text(), 'Welcome')]");
        this.actualOrders = page.locator(".order-info");
        this.noOrdersMessage = page.locator(".order-info", { hasText: "No orders yet." });   
    }

    async navigate() {
        await this.page.goto(this.url);
    }

    async clickHome() {
        await this.homeButton.click();
    }   

    async clickCart() {
        await this.cartButton.click();
    }   

    async clickProfile() {
        await this.profileButton.click();
    }
    

}