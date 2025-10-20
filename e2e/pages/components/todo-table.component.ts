import { Page } from "@playwright/test";
import { i18n } from "../../utils/i18n";

export class TodoTableComponent {
  constructor(private readonly page: Page) {};

  readonly container = this.page.locator('app-todo-table');
  readonly table = this.container.locator('table');
  private readonly tableBody = this.table.locator('tbody');
  readonly todoRows = this.tableBody.getByRole('row');
  readonly editInput = this.tableBody.getByTestId('edit-todo-title-input');
  readonly editButton = this.tableBody.getByTestId('edit-todo-title-button');

  readonly emptyRow = this.container.locator(`.empty:has-text('${i18n.todoTable.empty}')`);

  deleteTodoBtn(title: string) {
    const row = this.todoRow(title);
    return row.getByTitle('Supprimer');
  }

  completeCheckbox(title: string) {
    const row = this.todoRow(title);
    return row.getByTestId('todo-row-checkbox');
  }

  todoTextWrapper(title: string) {
    const row = this.todoRow(title);
    return row.getByTestId('todo-text-wrapper');
  }

  todoText(title: string) {
    const row = this.todoRow(title);
    return row.getByTestId('todo-text');
  }

  todoTitle(title: string) {
    return this.todoRows.getByTestId(`title-${title}`);
  }

  todoRow(title: string) {
    return this.todoRows.filter({ hasText: title });
  }
}