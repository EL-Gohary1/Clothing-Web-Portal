import { type Page, type Locator } from "@playwright/test";

export class CustomerCartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartButton: Locator;
  readonly homeButton: Locator;
  readonly orderButton: Locator;
  readonly profileButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly cartItems: Locator;
  readonly totalPrice: Locator;
  readonly url: string = "/customer/cart";

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.getByRole("button", { name: "Checkout" });
    this.cartButton = page.frameLocator(".nav-frame").getByRole("button", { name: "Cart" });
    this.homeButton = page.frameLocator(".nav-frame").getByRole("button", { name: "Home" });
    this.orderButton = page.frameLocator(".nav-frame").getByRole("button", { name: "Orders" });
    this.profileButton = page.frameLocator(".nav-frame").getByRole("button", { name: "Profile" });
    this.emptyCartMessage = page.getByText("Your cart is empty");
    this.cartItems = page.locator(".cart-item");
    this.totalPrice = page.locator(".total-display", { hasText: "Total:" });

  }

  async navigate() {
    await this.page.goto(this.url);
  }

  async getCartItemsCount() {
    return await this.cartItems.count();
  }

  async getTotalPrice() {
    const totalText = await this.totalPrice.textContent();
    if (!totalText) return 0;
    const numbers = totalText.match(/[\d.]+/g);
    if (numbers) {
      let finalTotal = 0;
      for (const num of numbers) {
        finalTotal += parseFloat(num);
      }
      return finalTotal;
    }
    return 0;
  }

  async increaseItemQuantity(itemName: string) {
    const item = this.cartItems.filter({ hasText: itemName });
    await item.getByRole("button", { name: "+" }).click();
    const responsePromise = this.page.waitForResponse(res => 
        res.url().includes('/customer/cart') && res.request().method() === 'PUT'
    );
    await responsePromise;
  }

  async decreaseItemQuantity(itemName: string) {
    const item = this.cartItems.filter({ hasText: itemName });
    await item.getByRole("button", { name: "-" }).click();
  }

  async removeItem(itemName: string) {
    const responsePromise = this.page.waitForResponse(response => 
      response.url().includes('/customer/cart') && response.request().method() === 'DELETE'
    );
    const item = this.cartItems.filter({ hasText: itemName });
    await item.getByRole('button', { name: "🗑️" }).click();
    await responsePromise;
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async getItemQuantity(itemName: string) {
    const item = this.cartItems.filter({ hasText: itemName });
    const quantityText = await item.locator("//span[contains(@id, 'qty')]").textContent();
    return quantityText ? parseInt(quantityText) : 0;
  }

  async isCartEmpty() {
    return await this.emptyCartMessage.isVisible();
  }

  async getItemPrice(itemName: string) {
    const item = this.cartItems.filter({ hasText: itemName });
    const priceText = await item.locator(".price-box").textContent();
    if (!priceText) return 0;
    const number = priceText.match(/[\d.]+/);
    if (number) {
      return parseFloat(number[0]);
    } 
    return 0;
  }

  async getItemTotalPrice(itemName: string) {
    const item = this.cartItems.filter({ hasText: itemName });
    const subTotalText = await item.locator(".item-subtotal").textContent();
    if (!subTotalText) return 0;
    const numbers = subTotalText.match(/[\d.]+/);
    if (numbers) {
      return parseFloat(numbers[0]);
    }
    return 0;
  }

  async getItemsNames() {
    const names = [];
    const count = await this.getCartItemsCount(); 
    for (let i = 0; i < count; i++) {
        const name = await this.cartItems.nth(i).locator(".item-name").textContent();
        if (name) {
            names.push(name.trim());
        }
    }
    return names;
  }

  

}
