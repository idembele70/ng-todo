import { Page } from "@playwright/test";

export class TodoTableComponent {
  constructor(readonly page: Page) {}

  readonly table = this.page.locator('table');
  private readonly tableBody = this.table.locator('tbody');
  readonly todoRow = this.tableBody.getByRole('row');
}