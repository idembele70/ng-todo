import { Page } from "@playwright/test";

export class AddFormComponent {
  constructor(private readonly page: Page) {}

  readonly todoInput = this.page.locator('input[name="todoInput"]');
  readonly addBtn = this.page.getByRole('button', { name: 'Ajouter' });
}