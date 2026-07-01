import { Page, Locator } from '@playwright/test';


export class userProfilePage {
    
    readonly page: Page;
    readonly userName: Locator;
    readonly email: Locator;
    readonly editProfileButton: Locator;
    readonly logOutButton: Locator;
    readonly doneButton: Locator;
    readonly pageTitle: Locator;
    readonly url: string;
    constructor(page: Page) {
        this.page = page;
        this.userName = this.page.locator('#userName');
        this.email = this.page.locator('#userEmail');
        this.editProfileButton = this.page.getByRole('button', { name: 'Edit' });
        this.logOutButton = this.page.getByRole('button', { name: 'Log Out' });
        this.doneButton = this.page.getByRole('button', { name: 'Done' });
        this.pageTitle = this.page.getByRole('heading', { name: 'welcome to your profile page !' });
        this.url = '/auth/profile';
    }

    async navigate() { 
        await this.page.goto(this.url);
    }

    async clickEditProfile() {
        return await this.editProfileButton.click();
    }

    async clickLogOut() {
        return await this.logOutButton.click();
    }
    async clickDone() {   
        return await this.doneButton.click();
    }   

    async getUserName() {
        return await this.userName.inputValue();
    }

    async getEmail() {
        return await this.email.inputValue();
    }

    async fillUserName(newName: string) {
    await this.userName.fill(newName);
    }

    async fillEmail(newEmail: string) {
        await this.email.fill(newEmail);
    }

    async updateProfileData(newName: string, newEmail: string) {
        await this.clickEditProfile();
        await this.fillUserName(newName);
        await this.clickDone();
    }



}