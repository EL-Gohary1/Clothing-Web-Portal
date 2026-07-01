import { Page, Locator } from '@playwright/test';

export class AddUserPage {
    readonly page: Page;
    readonly url: string;
    readonly nameInput: Locator;
    readonly passwordInput: Locator;
    readonly emailInput: Locator;
    
    readonly customerRadio: Locator;
    readonly supplierRadio: Locator;

    readonly saveButton: Locator;
    readonly backButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.url = "/admin-dashboard/add-user";

        this.nameInput = page.locator('#userName');
        this.passwordInput = page.locator('#userPassword');
        this.emailInput = page.locator('#userEmail');

        this.customerRadio = page.locator('input[name="role"][value="Customer"]');
        this.supplierRadio = page.locator('input[name="role"][value="Supplier"]');

        this.saveButton = page.locator('.btn-save');
        this.backButton = page.locator('.btn-back');
    }


    async fillName(name: string) {
        await this.nameInput.fill(name);
    }

    async fillPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async fillEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async selectRole(role: 'Customer' | 'Supplier') {
        if (role === 'Customer') {
            await this.customerRadio.check();
        } else if (role === 'Supplier') {
            await this.supplierRadio.check();
        }
    }

    async clickSave() {
        await this.saveButton.click();
    }

    async clickBack() {
        await this.backButton.click();
    }

    async fillUserFormAndSave(name: string, pass: string, email: string, role: 'Customer' | 'Supplier') {
        await this.fillName(name);
        await this.fillPassword(pass);
        await this.fillEmail(email);
        await this.selectRole(role);
        await this.clickSave();
    }
}