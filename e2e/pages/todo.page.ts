import { expect, Page, request } from "@playwright/test";
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
    await this.page.goto('');
  }

  async addTodo(title: string) {
    await this.addTodoForm.todoInput.fill(title);
    await expect(this.addTodoForm.spinner).toBeVisible();
    await expect(this.addTodoForm.spinner).toBeHidden();
    await this.addTodoForm.addBtn.click();

    const notifySuccess = this.toastrContainer.filter({ hasText: i18n.addTodoForm.button.messages.success });

    await notifySuccess.waitFor({ state: 'visible' });
    await notifySuccess.waitFor({ state: 'hidden' });

  }

  async assertDuplicateTodoErrorAfterTyping(title: string) {
    await this.addTodoForm.todoInput.fill(title);
    await this.assertNotification(i18n.addTodoForm.input.existing.messages.error);
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

  async assertNotification(message: string) {
    const notificationLocator = this.toastrContainer.filter({ hasText: message });

    await notificationLocator.waitFor({ state: 'visible' });
    await notificationLocator.waitFor({ state: 'hidden' });
  }

  async assertDefaultTodoState(title: string) {
    const todoTitle = this.todoTable.todoTitle(title);
    await expect(todoTitle).toHaveAttribute('title', i18n.todoTable.row.title.editing.idle);
    const checkbox = this.todoTable.completeCheckbox(title);
    await expect(checkbox).toHaveAttribute('title', i18n.todoTable.row.checkboxLabel.unCompleted.title);
  }

  async assertTodoTitleInEditingState(title: string) {
    const todoTitle = this.todoTable.todoTitle(title);
    await expect(todoTitle).toBeVisible();
    await expect(todoTitle).toHaveAttribute('title', i18n.todoTable.row.title.editing.active);
    await expect(this.todoTable.editInput).toBeVisible();
    await expect(this.todoTable.editInput).toHaveValue(title);
  }

  async assertAllControlsDisabled(title: string) {
    const checkbox = this.todoTable.completeCheckbox(title);
    const deleteBtn = this.todoTable.deleteTodoBtn(title);

    await Promise.all([
      expect(this.addTodoForm.addBtn).toBeDisabled(),
      expect(this.header.removeAllButton).toBeDisabled(),
      expect(this.header.removeCompletedButton).toBeDisabled(),
      expect(checkbox).toBeDisabled(),
      expect(this.todoTable.editButton).toBeDisabled(),
      expect(deleteBtn).toBeDisabled(),
      expect(this.footer.previousButton).toBeDisabled(),
      expect(this.footer.nextButton).toBeDisabled(),
    ]);
  }

  async assertTodoRowControlsEnabled(title: string) {
    const checkbox = this.todoTable.completeCheckbox(title);
    const deleteBtn = this.todoTable.deleteTodoBtn(title);
    const editBtn = this.todoTable.editButton;
    const todoTitle = this.todoTable.todoTitle(title);

    await Promise.all([
      expect(checkbox).toBeEnabled(),
      expect(todoTitle).toHaveAttribute('title', i18n.todoTable.row.title.editing.idle),
      expect(editBtn).toBeEnabled(),
      expect(deleteBtn).toBeEnabled(),
    ]);
  }
}