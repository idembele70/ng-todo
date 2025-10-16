import test, { expect, Page } from "@playwright/test";
import { TodoPage } from "./pages/todo.page";

test.describe('Todo completion', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page;
  let todoPage: TodoPage;

  test.beforeAll( async ({ browser }) => {
    await TodoPage.resetDB();

    page = await browser.newPage();
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterAll(async () => {
    await TodoPage.resetDB();

    await page.close();
  });

  test('It should mark a todo as completed', async () => {
    const title = 'todo to complete';
    await todoPage.addTodo(title);
    const completeCheckbox = todoPage.todoTable.completeCheckbox(title);
    await completeCheckbox.click();

    await expect(completeCheckbox).toBeChecked();
  });

  test('It should unmark a completed todo', async () => {
    const title = 'todo to uncomplete';
    await todoPage.addTodo(title);

    await todoPage.completeTodo(title);
    const checkbox = todoPage.todoTable.completeCheckbox(title);

    await expect(checkbox).toBeChecked();
    await todoPage.unCompleteTodo(title);
    await expect(checkbox).not.toBeChecked();
  });
});