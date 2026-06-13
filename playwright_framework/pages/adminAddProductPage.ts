import  {type Locator, type Page} from "@playwright/test";

export class AdminAddProductPage {
    readonly page: Page;
    readonly productNameInput: Locator
    readonly productDescriptionInput: Locator;
    readonly productPriceInput: Locator
    readonly productImageInput: Locator;
    readonly productStockInput: Locator;
    readonly supplierIdInput: Locator;
    readonly submitButton: Locator;
    readonly url: string = "/admin-dashboard/add-product";

    constructor(page: Page) {
        this.page = page;
        this.productNameInput = page.getByPlaceholder("Enter product Name");    
        this.productDescriptionInput = page.getByPlaceholder("Enter product description");
        this.productPriceInput = page.getByPlaceholder("Enter Price");
        this.productImageInput = page.getByPlaceholder("Enter photo URL");
        this.productStockInput = page.getByPlaceholder("Enter quantity");
        this.supplierIdInput = page.getByPlaceholder("Enter supplier ID")
        this.submitButton = page.getByRole("button", { name: "Submit" });
    }

    async navigate() {
        await this.page.goto(this.url);
    }

    async addProduct(name: string, description: string, price: string, imageUrl: string, stock: string, supplierId: string) {
        await this.productNameInput.fill(name);
        await this.productDescriptionInput.fill(description);
        await this.productPriceInput.fill(price.toString());
        await this.productImageInput.fill(imageUrl);
        await this.productStockInput.fill(stock.toString());
        await this.supplierIdInput.fill(supplierId.toString());
        await this.submitButton.click();
        await this.page.waitForURL('/admin-dashboard/products');
    }
    
    
};
