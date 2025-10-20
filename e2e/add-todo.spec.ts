import test, { expect, Page } from "@playwright/test"
import { TodoPage } from "./pages/todo.page"
import { i18n } from "./utils/i18n";

test.describe('It should add a new todo', () => {
  test.describe.configure({ mode: 'serial' })
  
  let page: Page;
  let todoPage: TodoPage;
 
  test.beforeAll(async ({ browser }) => {
    await TodoPage.resetDB();

    page = await browser.newPage()
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterAll(async () => {
    await TodoPage.resetDB();

    await page.close();
  });

  test('It should add a todo when pressing Enter', async () => {
    const title = 'My first todo';
    const todoCount = 1;
  
    await todoPage.addTodoForm.todoInput.fill(title);
    await todoPage.addTodoForm.todoInput.press('Enter');
    
    await expect(todoPage.todoTable.todoRows).toHaveCount(todoCount);
    await todoPage.assertDefaultTodoState(title);
  });

  test('It should add a todo when clicking Add button', async () => {
    const title = 'Second todo';
    const todoCount = 2;

    await todoPage.addTodoForm.todoInput.fill(title);
    await todoPage.addTodoForm.addBtn.click();
    await expect(todoPage.todoTable.todoRows).toHaveCount(todoCount)
  });

  test('It should reject todo title containing only whitespace', async () => {
    const title = '  ';
    const todoCount = 2;

    await todoPage.addTodoForm.todoInput.fill(title);
    await todoPage.addTodoForm.addBtn.click();
    await todoPage.assertNotification(i18n.addTodoForm.input.whitespace.messages.error);
    await expect(todoPage.todoTable.todoRows).toHaveCount(todoCount);
  });

  test('It should trim leading and trailing space from todo title before adding', async () => {
    const title = ' todo containing whitespace ';
    const trimmedTitle = title.trim();
    const todoCount = 3;

    await todoPage.addTodoForm.todoInput.fill(title);
    await todoPage.addTodoForm.addBtn.click();
    await todoPage.assertNotification(i18n.addTodoForm.button.messages.success);
    const todoText = todoPage.todoTable.todoText(trimmedTitle);
    await expect(todoText).toBeVisible();
    await expect(todoText).toHaveText(trimmedTitle);
    await expect(todoPage.todoTable.todoRows).toHaveCount(todoCount);
  });
 
  test('It should truncate todo title longer than 40 characters', async () => {
    const tooLongTitle = 'This title contains more than 40 characters';
    const expectedTitle = 'This title contains more than 40 charact';

    await todoPage.addTodoForm.todoInput.fill(tooLongTitle);
    await todoPage.addTodoForm.addBtn.click();

    await todoPage.assertNotification(i18n.addTodoForm.button.messages.success);
    const todoText = todoPage.todoTable.todoText(expectedTitle);
    await expect(todoText).toHaveText(expectedTitle);
  });

  test('It should accept titles exactly 40 characters long', async () => {
    const title = 'This todo title contains 40 char no more';

    await todoPage.addTodoForm.todoInput.fill(title);
    await todoPage.addTodoForm.addBtn.click();

    await todoPage.assertNotification(i18n.addTodoForm.button.messages.success);
    const todoText = todoPage.todoTable.todoText(title);
    await expect(todoText).toHaveText(title);
    const todoTitleLength = (await todoText.innerText()).length;
    const maxLength = 40;
    expect(todoTitleLength).toBe(maxLength);
  });
})