import {test, expect} from './test-base';


test.describe('Customer profile Tests', () => {

    test.beforeEach(async ({ customerProfilePage }) => {
        await customerProfilePage.navigate();
    });
    
    test('Customer can edit his name', async ({ customerProfilePage }) => {
        
        await expect(customerProfilePage.page).toHaveURL('/customer/profile');
        const profileName = await customerProfilePage.getUserName();
        await customerProfilePage.clickEditProfile();
        const newName = 'John Doe';
        await customerProfilePage.fillUserName(newName);
        await customerProfilePage.clickDone();
        const updatedProfileName = await customerProfilePage.getUserName();
        expect(updatedProfileName).toBe(newName);
    });

});
