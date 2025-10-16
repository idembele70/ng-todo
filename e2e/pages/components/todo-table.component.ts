import { Page } from "@playwright/test";

export class TodoTableComponent {
  constructor(private readonly page: Page) {}

  readonly table = this.page.locator('table');
  private readonly tableBody = this.table.locator('tbody');
  readonly todoRows = this.tableBody.getByRole('row');
  readonly editInput = this.tableBody.getByTestId('edit-todo-title-input');
  readonly editButton = this.tableBody.getByTestId('edit-todo-title-button')

  deleteTodoBtn(title: string) {
    const row = this.todoRow(title);
    return row.getByTitle('Supprimer');
  }

  completeCheckbox(title: string) {
    const row = this.todoRow(title);
    return row.getByTestId('todo-row-checkbox');
  }

  todoTitleWrapper(title: string) {
    const row = this.todoRow(title);
    return row.getByTestId('todo-text-wrapper');
  }
  
  todoTitle(title: string) {
    const row = this.todoRow(title);
    return row.getByTestId('todo-text');
  }

  todoRow(title: string) {
    return this.todoRows.filter({ hasText: title});
  }
}