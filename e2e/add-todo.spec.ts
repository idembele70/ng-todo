import test, { expect, Page } from "@playwright/test"
import { TodoPage } from "./pages/todo.page"

test.describe('It should add a new todo', () => {
  test.describe.configure({ mode: 'serial' })
  
  let page: Page;
  let todoPage: TodoPage;

  
  test.beforeAll(async ({ browser }) => {
    await TodoPage.resetDB();

    page = await browser.newPage()
    todoPage = new TodoPage(page);
    await todoPage.goto();
  })

  test.afterAll(async () => {
    await TodoPage.resetDB();

    await page.close();
  })

  test('It should add a todo when pressing Enter', async () => {
    const title = 'My first todo';
    const todoCount = 1;
  
    await todoPage.addTodoForm.todoInput.fill(title);
    await todoPage.addTodoForm.todoInput.press('Enter');
    
    await expect(todoPage.todoTable.todoRows).toHaveCount(todoCount);
  });
  
  test('It should add a todo when clicking Add button', async () => {
    const title = 'Second todo';
    const todoCount = 2;

    await todoPage.addTodoForm.todoInput.fill(title);
    await todoPage.addTodoForm.addBtn.click();
    await expect(todoPage.todoTable.todoRows).toHaveCount(todoCount)
  })
})