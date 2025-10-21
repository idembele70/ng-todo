import { Page } from "@playwright/test";
import { i18n } from "../../utils/i18n";

export class AddFormComponent {
  constructor(private readonly page: Page) {}

  private readonly container = this.page.locator('form');
  readonly todoInput = this.container.locator('input[name="todoInput"]');
  readonly spinner = this.container.locator('.spinner');
  readonly addBtn = this.container.getByRole('button', { name: i18n.addTodoForm.button.title });
}