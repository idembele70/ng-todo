import test, { expect, Page } from "@playwright/test";
import { TodoPage } from "./pages/todo.page";
import { i18n } from "./utils/i18n";

test.describe('Todo Deletion', () => {
  let page: Page;
  let todoPage: TodoPage;

  const EMPTY_TODO_COUNT = 0;

  test.beforeAll(async ({ browser }) => {
    await TodoPage.resetDB();

    page = await browser.newPage();
    todoPage = new TodoPage(page);

    await todoPage.goto();
  });

  test('It should delete a single todo successfully', async () => {
    const title = 'todo to delete title';

    await todoPage.addTodo(title);
    await todoPage.todoTable.deleteTodoBtn(title).click();

    await expect(todoPage.todoTable.todoRows).toHaveCount(EMPTY_TODO_COUNT);
  });

  test('It should delete all todos', async () => {
    const titles = ['first todo', 'second todos', 'last todo'];
    const removeAllBtn = todoPage.header.removeAllButton

    await test.step('The button should be disabled if no todos', async () => {
      await expect(removeAllBtn).toBeDisabled();
    });

    for (const title of titles) {
      await todoPage.addTodo(title);
    }

    await expect(removeAllBtn).toBeEnabled();
    await removeAllBtn.click();
    await expect(todoPage.todoTable.todoRows).toHaveCount(EMPTY_TODO_COUNT);
    await expect(removeAllBtn).toBeDisabled();
  });

  test('It should delete todos marked as complete', async () => {
    const uncompletedTodosCount = 1;
    const completedTodosTitle = ['first completed todo', 'second complete todo'];
    const unCompletedTodosTitle = ['first uncompleted todos'];
    const removeCompletedBtn = todoPage.header.removeCompletedButton;

    await test.step('The button should be disabled if no completed todos', async () => {
      await expect(removeCompletedBtn).toBeDisabled();
      await expect(removeCompletedBtn).toHaveAttribute('title', i18n.header.clear.completed.title.disabled);
    });
    
    for (const title of completedTodosTitle) {
      await todoPage.addTodo(title);
      await todoPage.completeTodo(title);
    }
    
    for (const title of unCompletedTodosTitle) {
      await todoPage.addTodo(title);
    }
    
    await expect(removeCompletedBtn).toBeEnabled();
    await expect(removeCompletedBtn).toHaveAttribute('title', i18n.header.clear.completed.title.enabled)
    
    await removeCompletedBtn.click();
    await expect(todoPage.todoTable.todoRows).toHaveCount(uncompletedTodosCount);
    await expect(removeCompletedBtn).toBeDisabled();
    await expect(removeCompletedBtn).toHaveAttribute('title', i18n.header.clear.completed.title.disabled);
    await expect(removeCompletedBtn).toHaveCSS('cursor', 'not-allowed');
  })
})