import { request, Page } from "@playwright/test";
import { AddFormComponent } from "./components/add-form.component";
import { TodoTableComponent } from "./components/todo-table.component";

export class TodoPage {
  constructor(private readonly page: Page) {}
  readonly addTodoForm = new AddFormComponent(this.page);
  readonly todoTable = new TodoTableComponent(this.page);

  async goto() {
    await this.page.goto('/');
  }

  async addTodo(title: string) {
    await this.addTodoForm.todoInput.fill(title);
    await this.addTodoForm.addBtn.click();
  }

  static async resetDB() {
    const apiRequest = await request.newContext();
    const url = process.env['BACKEND_URL'] + '/todos';
    await apiRequest.delete(url);
  }
}