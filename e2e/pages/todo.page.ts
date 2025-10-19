import { Page, request } from "@playwright/test";
import { i18n } from "../utils/i18n";
import { AddFormComponent } from "./components/add-form.component";
import FooterComponent from "./components/footer.component";
import HeaderComponent from "./components/header.component";
import { TodoTableComponent } from "./components/todo-table.component";

export class TodoPage {
  constructor(private readonly page: Page) { }
  readonly header = new HeaderComponent(this.page);
  readonly addTodoForm = new AddFormComponent(this.page);
  readonly todoTable = new TodoTableComponent(this.page);
  readonly footer = new FooterComponent(this.page);

  readonly toastrContainer = this.page.locator('#toast-container');

  async goto() {
    await this.page.goto('/');
  }

  async addTodo(title: string) {
    await this.addTodoForm.todoInput.fill(title);
    await this.addTodoForm.addBtn.click();

    const notifySuccess = this.toastrContainer.filter({ hasText: i18n.addTodoForm.add.messages.success });

    await notifySuccess.waitFor({ state: 'visible' });
    await notifySuccess.waitFor({ state: 'hidden' });

  }

  async completeTodo(title: string) {
    const isChecked = await this.todoTable.completeCheckbox(title).isChecked();
    if (isChecked) return;

    await this.todoTable.completeCheckbox(title).click();
  }

  async unCompleteTodo(title: string) {
    const isChecked = await this.todoTable.completeCheckbox(title).isChecked();
    if (!isChecked) return;

    await this.todoTable.completeCheckbox(title).click();
  }

  async deleteTodo(title: string) {
    const row = this.todoTable.todoRow(title);
    await row.getByTestId('delete-todo').click();
  }

  static async resetDB() {
    const apiRequest = await request.newContext();
    const url = process.env['BACKEND_URL'] + '/todos';
    await apiRequest.delete(url);
  }

  async blur() {
    const body = this.page.locator('body');
    await body.click({
      position:
        { x: 0, y: 0 }
    });
  }
}