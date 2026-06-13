import { Page, Locator } from '@playwright/test';

export class AdminProductsPage {
    readonly page: Page;
    readonly url: string;
    
    readonly searchInput: Locator;
    readonly searchButton: Locator;

    readonly allTab: Locator;
    readonly approvedTab: Locator;
    readonly pendingTab: Locator;

    readonly productItems: Locator;
    readonly noProductMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.url = "/admin-dashboard/products";

        this.searchInput = page.getByPlaceholder('Search products by name...');
        this.searchButton = page.getByRole('button', { name: 'Search' });

        this.allTab = page.locator('.sub-tab[data-filter="all"]');
        this.approvedTab = page.locator('.sub-tab[data-filter="APPROVED"]');
        this.pendingTab = page.locator('.sub-tab[data-filter="PENDING"]');

        this.productItems = page.locator('.product-item');
        this.noProductMessage = page.locator('#noProductMessage');
    }

    async navigate() {
        await this.page.goto(this.url);
    }

    async searchForProduct(productName: string) {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
    }

    async filterByAll() {
        await this.allTab.click();
    }

    async filterByApproved() {
        await this.approvedTab.click();
    }

    async filterByPending() {
        await this.pendingTab.click();
    }

    async getProductsCount() {
        return await this.productItems.count();
    }

    getProductById(productId: string | number): Locator {
        return this.page.locator(`.product-item[data-id="${productId}"]`);
    }

    async approveProduct(productId: string | number) {
        const product = this.getProductById(productId);
        await product.locator('.approve-btn').click();
    }

    async rejectProduct(productId: string | number) {
        const product = this.getProductById(productId);
        await product.locator('.reject-btn').click();
    }

    async deleteProduct(productId: string | number) {
        const product = this.getProductById(productId);
        await product.locator('.delete-icon').click();
    }

    async getProductStatus(productId: string | number) {
        const product = this.getProductById(productId);
        return await product.locator('.status-badge').textContent().then(text => text?.trim());
    }

    async isNoProductMessageVisible() {
        return await this.noProductMessage.isVisible();
    }

    async getAllProductIds() {
        const ids: string[] = [];
        const count = await this.getProductsCount();
        for (let i = 0; i < count; i++) {
            const id = await this.productItems.nth(i).getAttribute('data-id');
            if (id) ids.push(id);
        }
        return ids;
    }

    
}