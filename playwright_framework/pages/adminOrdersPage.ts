import {Page, Locator} from '@playwright/test';

export class AdminOrdersPage {
    readonly page: Page;
    readonly url: string;
    readonly customerLink: Locator;
    readonly supplierLink: Locator;
    readonly productLink: Locator;
    readonly orderLink: Locator;
    readonly orderItems: Locator;

    constructor(page:Page){
        this.page = page;
        this.url = "/admin-dashboard/orders";
        this.customerLink = page.getByRole('link', {name: 'Customers'});
        this.orderLink = page.getByRole('link', {name: 'Orders'});
        this.supplierLink = page.getByRole('link', {name: 'Suppliers'});
        this.productLink = page.getByRole('link', {name: 'Products'});
        this.orderLink = page.getByRole('link', {name: 'Orders'});
        this.orderItems = page.locator('.order-item');

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

    async getCountOfOrders() {
        const count = await this.orderItems.count();
        return count;
    }

    async getOrdersCustomerEmailList() {
        const emails: string[] = [];
        const orderCount = await this.orderItems.count();
        for (let i = 0; i < orderCount; i++) {
           const email = await this.orderItems.nth(i).locator('.order-details').evaluate((el) => {
                const strongTags = Array.from(el.querySelectorAll('strong'));
                const customerEmailTag = strongTags.find(tag => tag.textContent?.includes('Customer Email:'));               
                if (customerEmailTag && customerEmailTag.nextSibling) {
                    return customerEmailTag.nextSibling.textContent?.replace(/"/g, '').trim();
                }
                return null;
            });
            if (email) {
                emails.push(email.trim());
            }
        }
        return emails;   
    }

    async getOrdersSupplierEmailList() {
        const emails: string[] = [];
        const orderCount = await this.orderItems.count();
        for (let i = 0; i < orderCount; i++) {
           const email = await this.orderItems.nth(i).locator('.order-details').evaluate((el) => {
                const strongTags = Array.from(el.querySelectorAll('strong'));
                const customerEmailTag = strongTags.find(tag => tag.textContent?.includes('Supplier Emails:'));               
                if (customerEmailTag && customerEmailTag.nextSibling) {
                    return customerEmailTag.nextSibling.textContent?.replace(/"/g, '').trim();
                }
                return null;
            });
            if (email) {
                emails.push(email.trim());
            }
        }
        return emails;   
    }

    async getOrdersReceiversList() {
        const emails: string[] = [];
        const orderCount = await this.orderItems.count();
        for (let i = 0; i < orderCount; i++) {
           const email = await this.orderItems.nth(i).locator('.order-details').evaluate((el) => {
                const strongTags = Array.from(el.querySelectorAll('strong'));
                const customerEmailTag = strongTags.find(tag => tag.textContent?.includes('Receiver:'));               
                if (customerEmailTag && customerEmailTag.nextSibling) {
                    return customerEmailTag.nextSibling.textContent?.replace(/"/g, '').trim();
                }
                return null;
            });
            if (email) {
                emails.push(email.trim());
            }
        }
        return emails;   
    }

    async getOrdersIdsList() {
        const ids: string[] = [];
        const orderCount = await this.orderItems.count();        
        for (let i = 0; i < orderCount; i++) {
            const id = await this.orderItems.nth(i).getAttribute('data-id');
            if (id) {
                ids.push(id);
            }
        }
        return ids;
    }

    

    async getOrderCustomerEmailByIndex(index: number) {
        const email = await this.orderItems.nth(index).locator('.order-details').evaluate((el) => {
            const strongTags = Array.from(el.querySelectorAll('strong'));
            const customerEmailTag = strongTags.find(tag => tag.textContent?.includes('Customer Email:'));
            if (customerEmailTag && customerEmailTag.nextSibling) {
                return customerEmailTag.nextSibling.textContent?.replace(/"/g, '').trim();
            }
            return null;
        });
        return email;
    }

    async getOrderSupplierEmailByIndex(index: number) {
        const email = await this.orderItems.nth(index).locator('.order-details').evaluate((el) => {
            const strongTags = Array.from(el.querySelectorAll('strong'));
            const customerEmailTag = strongTags.find(tag => tag.textContent?.includes('Supplier Emails:'));
            if (customerEmailTag && customerEmailTag.nextSibling) {
                return customerEmailTag.nextSibling.textContent?.replace(/"/g, '').trim();
            }
            return null;
        });
        return email;
    }

    async getOrderReceiverByIndex(index: number) {
        const email = await this.orderItems.nth(index).locator('.order-details').evaluate((el) => {
            const strongTags = Array.from(el.querySelectorAll('strong'));
            const customerEmailTag = strongTags.find(tag => tag.textContent?.includes('Receiver:'));
            if (customerEmailTag && customerEmailTag.nextSibling) {
                return customerEmailTag.nextSibling.textContent?.replace(/"/g, '').trim();
            }
            return null;
        });
        return email;
    }

    async getOrdersIdByIndex(index: number) {
        const id = await this.orderItems.nth(index).getAttribute('data-id');
        return id;
    }

    async getOrderCustomerEmailByOrderId(id: string) {
        const orderIds = await this.getOrdersIdsList();
        const index = orderIds.indexOf(id);
        return await this.getOrderCustomerEmailByIndex(index);
        
    }

    async getOrderSupplierEmailByOrderId(id: string) {
        const orderIds = await this.getOrdersIdsList();
        const index = orderIds.indexOf(id);
        return await this.getOrderSupplierEmailByIndex(index);
    }

    async getOrderReceiverByOrderId(id: string) {
        const orderIds = await this.getOrdersIdsList();
        const index = orderIds.indexOf(id);
        return await this.getOrderReceiverByIndex(index);
    }



}



