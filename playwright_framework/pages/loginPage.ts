import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly submitButton: Locator;
  readonly loginError: Locator;
  readonly togglePasswordButton: Locator;
  readonly registerLink: Locator;
  readonly url: string;

  constructor(page: Page) {
    this.page = page;
    this.url = "/auth/login";
    this.emailField = page.getByLabel("email");
    this.passwordField = page.getByRole("textbox", { name: "Password" });
    this.submitButton = page.getByRole("button", { name: "Submit" });
    this.loginError = page.locator("#loginError");
    this.togglePasswordButton = page.getByLabel("Show or hide password");
    this.registerLink = page.getByRole("link", { name: "Sign up here" });
  }

  async navigate() {
    await this.page.goto(this.url);
  }

  async login(email: string, password: string) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
  
}
