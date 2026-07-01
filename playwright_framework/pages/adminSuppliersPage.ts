import {Page, Locator} from '@playwright/test';

export class AdminSuppliersPage {
    readonly page: Page;
    readonly url: string;
    readonly customerLink: Locator;
    readonly supplierLink: Locator;
    readonly productLink: Locator;
    readonly orderLink: Locator;
    readonly supplierItems: Locator;

    constructor(page:Page){
        this.page = page;
        this.url = "/admin-dashboard/suppliers";
        this.customerLink = page.getByRole('link', {name: 'Customers'});
        this.supplierLink = page.getByRole('link', {name: 'Suppliers'});
        this.productLink = page.getByRole('link', {name: 'Products'});
        this.orderLink = page.getByRole('link', {name: 'Orders'});
        this.supplierItems = page.locator('.supplier-item');

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

    async getSuppliersEmailList() {
        const emails: string[] = [];
        const supplierCount = await this.supplierItems.count();
        for (let i = 0; i < supplierCount; i++) {
            const email = await this.supplierItems.nth(i).locator('.supplier-details').textContent();
            if (email) {
                emails.push(email.trim());
            }
        }
        return emails;   
    }

    async getSuppliersNameList() {
        const names: string[] = [];
        const supplierCount = await this.supplierItems.count();
        for (let i = 0; i < supplierCount; i++) {
            const name = await this.supplierItems.nth(i).locator('.supplier-title').textContent();
            if (name) {
                names.push(name.trim());
            }
        }
        return names; 
    }

    async getCountOfSuppliers() {
        const count = await this.supplierItems.count();
        return count;
    }

    async getSupplierNameByIndex(index: number) {
        const name = await this.supplierItems.nth(index).locator('.supplier-title').textContent();
        return name ? name.trim() : null;
    }

    async getSupplierEmailByIndex(index: number) {
        const email = await this.supplierItems.nth(index).locator('.supplier-details').textContent();
        return email ? email.trim() : null;
    }

    async getSupplierNameByEmail(email: string) {
        const supplierItem = this.supplierItems.filter({ hasText: email });
        const name = await supplierItem.locator('.supplier-title').textContent();
        return name ? name.trim() : null;
    }

    async getSupplierEmailByName(name: string) {
        const supplierItem = this.supplierItems.filter({ hasText: name });
        const email = await supplierItem.locator('.supplier-details').textContent();
        return email ? email.trim() : null;
    }

    async getTrashIconBySupplierEmail(email: string) {
        const supplierItem = this.supplierItems.filter({ hasText: email });
        const trashIcon = supplierItem.getByRole('button', { name: "🗑️" });
        return trashIcon;
    }

    async getTrashIconBySupplierName(name: string) {
        const supplierItem = this.supplierItems.filter({ hasText: name });
        const trashIcon = supplierItem.getByRole('button', { name: "🗑️" });
        return trashIcon;
    }

    async getTrashIconBySupplierIndex(index: number) {
        const supplierItem = this.supplierItems.nth(index);
        const trashIcon = supplierItem.getByRole('button', { name: "🗑️" });
        return trashIcon;
    }

    async deleteSupplierByEmail(email: string) {
        const trashIcon = await this.getTrashIconBySupplierEmail(email);
        await trashIcon.click();
    }

    async deleteSupplierByName(name: string) { 
        const trashIcon = await this.getTrashIconBySupplierName(name);
        await trashIcon.click();
    }   

    async deleteSupplierByIndex(index: number) {
        const trashIcon = await this.getTrashIconBySupplierIndex(index);
        await trashIcon.click();
    }


}