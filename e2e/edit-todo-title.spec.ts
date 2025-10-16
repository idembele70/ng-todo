import test, { expect, Locator, Page } from "@playwright/test";
import { TodoPage } from "./pages/todo.page";

test.describe.serial('Edit Todo Title', () => {
  let page: Page;
  let todoPage: TodoPage;
  let todoTitleWrapper: Locator;
  let editInput: Locator;
  let todoTitle: Locator;
  let editButton: Locator;

  const TODO_TITLE = 'todo title';
  const TODO_TITLE_EDITED = 'edited title';

  test.beforeAll(async ({ browser }) => {
    await TodoPage.resetDB();

    page = await browser.newPage();
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo(TODO_TITLE);

    todoTitleWrapper = todoPage.todoTable.todoTitleWrapper(TODO_TITLE);
    editInput = todoPage.todoTable.editInput;
    todoTitle = todoPage.todoTable.todoTitle(TODO_TITLE_EDITED);
    editButton = todoPage.todoTable.editButton;
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Closes edit mode without changes', () => {
    test('It should close edit mode when pressing Escape key', async () => {
      await todoTitleWrapper.dblclick();
      await expect(editInput).toBeVisible();
      await editInput.press('Escape');
      await expect(editInput).toBeHidden();
    });

    test('It should close edit mode when pressing Enter key', async () => {
      await todoTitleWrapper.dblclick();
      await expect(editInput).toBeVisible();
      await editInput.press('Enter');
      await expect(editInput).toBeHidden();
    });

    test('It should close edit mode when input loses focus', async () => {
      await todoTitleWrapper.dblclick();
      await expect(editInput).toBeVisible();
      await todoPage.blur();
      await expect(editInput).toBeHidden();
    });

    test('It should enter edit mode when clicking edit button', async () => {
      await editButton.click();
      await expect(editInput).toBeVisible();
      await expect(editButton).toBeDisabled();
      await editButton.press('Escape');
    })
  });

  test.describe('Modify todo title and save', () => {
    test.beforeAll(async () => {
      await TodoPage.resetDB();
    });

    test.beforeEach(async () => {
      await todoPage.addTodo(TODO_TITLE);
      await todoTitleWrapper.dblclick();
      await editInput.fill(TODO_TITLE_EDITED);
    })

    test.afterEach(async () => {
      await todoPage.deleteTodo(TODO_TITLE_EDITED);
      const row = todoPage.todoTable.todoRow(TODO_TITLE_EDITED);
      await row.waitFor({ state: 'hidden' });
    })

    test('It should edit title and press Enter', async () => {
      await editInput.press('Enter');
      await expect(todoTitle).toBeVisible();
      await expect(todoTitle).toHaveText(TODO_TITLE_EDITED);
    });

    test('It should edit title and press Escape', async () => {
      await editInput.press('Escape');
      await expect(todoTitle).toBeVisible();
      await expect(todoTitle).toHaveText(TODO_TITLE_EDITED);
    });

    test('It should edit title and blur', async () => {
      await todoPage.blur();
      await expect(todoTitle).toBeVisible();
      await expect(todoTitle).toHaveText(TODO_TITLE_EDITED);
    });
  });
  test('It should keep previous title if user save with empty title', async () => {
    await todoPage.addTodo(TODO_TITLE_EDITED);
    await editButton.click();
    await editInput.clear();
    await editInput.press('Enter');
    await expect(todoTitle).toHaveText(TODO_TITLE_EDITED);
  });
})