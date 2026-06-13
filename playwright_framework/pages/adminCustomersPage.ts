import {Page, Locator} from '@playwright/test';

export class AdminCustomersPage {
    readonly page: Page;
    readonly url: string;
    readonly customerLink: Locator;
    readonly supplierLink: Locator;
    readonly productLink: Locator;
    readonly orderLink: Locator;
    readonly customerItems: Locator;

    constructor(page:Page){
        this.page = page;
        this.url = "/admin-dashboard/customers";
        this.customerLink = page.getByRole('link', {name: 'Customers'});
        this.supplierLink = page.getByRole('link', {name: 'Suppliers'});
        this.productLink = page.getByRole('link', {name: 'Products'});
        this.orderLink = page.getByRole('link', {name: 'Orders'});
        this.customerItems = page.locator('.customer-item');

    }

    async navigate() {
        await this.page.goto(this.url);
    }

    async clickCustomerLink() {
        await this.customerLink.click();
    }

    async clickSupplierLink() {
        await this.supplierLink.click();
    }

    async clickProductLink() {
        await this.productLink.click();
    }

    async clickOrderLink() {
        await this.orderLink.click();
    }

    async getCustomersEmailList() {
        const emails: string[] = [];
        const customerCount = await this.customerItems.count();
        for (let i = 0; i < customerCount; i++) {
            const email = await this.customerItems.nth(i).locator('.customer-details').textContent();
            if (email) {
                emails.push(email.trim());
            }
        }
        return emails;   
    }

    async getCustomersNameList() {
        const names: string[] = [];
        const customerCount = await this.customerItems.count();
        for (let i = 0; i < customerCount; i++) {
            const name = await this.customerItems.nth(i).locator('.customer-title').textContent();
            if (name) {
                names.push(name.trim());
            }
        }
        return names; 
    }

    async getCountOfCustomers() {
        const count = await this.customerItems.count();
        return count;
    }

    async getCustomerNameByIndex(index: number) {
        const name = await this.customerItems.nth(index).locator('.customer-title').textContent();
        return name ? name.trim() : null;
    }

    async getCustomerEmailByIndex(index: number) {
        const email = await this.customerItems.nth(index).locator('.customer-details').textContent();
        return email ? email.trim() : null;
    }

    async getCustomerNameByEmail(email: string) {
        const customerItem = this.customerItems.filter({ hasText: email });
        const name = await customerItem.locator('.customer-title').textContent();
        return name ? name.trim() : null;
    }

    async getCustomerEmailByName(name: string) {
        const customerItem = this.customerItems.filter({ hasText: name });
        const email = await customerItem.locator('.customer-details').textContent();
        return email ? email.trim() : null;
    }

    async getTrashIconByCustomerEmail(email: string) {
        const customerItem = this.customerItems.filter({ hasText: email });
        const trashIcon = customerItem.getByRole('button', { name: "🗑️" });
        return trashIcon;
    }

    async getTrashIconByCustomerName(name: string) {
        const customerItem = this.customerItems.filter({ hasText: name });
        const trashIcon = customerItem.getByRole('button', { name: "🗑️" });
        return trashIcon;
    }

    async getTrashIconByCustomerIndex(index: number) {
        const customerItem = this.customerItems.nth(index);
        const trashIcon = customerItem.getByRole('button', { name: "🗑️" });
        return trashIcon;
    }

    async deleteCustomerByEmail(email: string) {
        const trashIcon = await this.getTrashIconByCustomerEmail(email);
        await trashIcon.click();
    }

    async deleteCustomerByName(name: string) { 
        const trashIcon = await this.getTrashIconByCustomerName(name);
        await trashIcon.click();
    }   

    async deleteCustomerByIndex(index: number) {
        const trashIcon = await this.getTrashIconByCustomerIndex(index);
        await trashIcon.click();
    }


}