import { Page } from "@playwright/test";

export class TodoTableComponent {
  constructor(private readonly page: Page) {}

  readonly table = this.page.locator('table');
  private readonly tableBody = this.table.locator('tbody');
  readonly todoRow = this.tableBody.getByRole('row');

  deleteTodoBtn(title: string) {
    const todoRow = this.todoRow.filter({ hasText: title});
    return todoRow.getByTitle('Supprimer');
  }
  
  completeCheckboxLabel(title: string) {
    const todoRow = this.todoRow.filter({ hasText: title});
    return todoRow.getByTestId('todo-row-checkbox-label');
  }
  
  completeCheckbox(title: string) {
    const todoRow = this.todoRow.filter({ hasText: title});
    return todoRow.getByTestId('todo-row-checkbox');
  }
}