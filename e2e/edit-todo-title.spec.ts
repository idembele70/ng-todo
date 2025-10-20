import test, { expect, Locator, Page } from "@playwright/test";
import { TodoPage } from "./pages/todo.page";

test.describe.serial('Edit Todo Title', () => {
  let page: Page;
  let todoPage: TodoPage;
  let todoTextWrapper: Locator;
  let editInput: Locator;
  let todoText: Locator;
  let editButton: Locator;

  const TODO_TITLE = 'todo title';
  const TODO_TITLE_EDITED = 'edited title';

  test.beforeAll(async ({ browser }) => {
    await TodoPage.resetDB();

    page = await browser.newPage();
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo(TODO_TITLE);

    todoTextWrapper = todoPage.todoTable.todoTextWrapper(TODO_TITLE);
    editInput = todoPage.todoTable.editInput;
    todoText = todoPage.todoTable.todoText(TODO_TITLE_EDITED);
    editButton = todoPage.todoTable.editButton;
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Closes edit mode without changes', () => {
    test('It should close edit mode when pressing Escape key', async () => {
      await todoPage.assertDefaultTodoState(TODO_TITLE);
      await todoTextWrapper.dblclick();
      await todoPage.assertTodoTitleInEditingState(TODO_TITLE);

      await editInput.press('Escape');
      await expect(editInput).toBeHidden();
    });

    test('It should close edit mode when pressing Enter key', async () => {
      await todoTextWrapper.dblclick();
      await expect(editInput).toBeVisible();
      await editInput.press('Enter');
      await expect(editInput).toBeHidden();
    });

    test('It should close edit mode when input loses focus', async () => {
      await todoTextWrapper.dblclick();
      await expect(editInput).toBeVisible();
      await todoPage.blur();
      await expect(editInput).toBeHidden();
    });

    test('It should enter edit mode when clicking edit button', async () => {
      await editButton.click();
      await expect(editInput).toBeVisible();
      await expect(editButton).toBeDisabled();
      await editInput.press('Escape');
    })
  });

  test.describe('Modify todo title and save', () => {
    test.beforeAll(async () => {
      await TodoPage.resetDB();
    });

    test.beforeEach(async () => {
      await todoPage.addTodo(TODO_TITLE);
      await todoTextWrapper.dblclick();
      await editInput.fill(TODO_TITLE_EDITED);
    })

    test.afterEach(async () => {
      await todoPage.deleteTodo(TODO_TITLE_EDITED);
      const row = todoPage.todoTable.todoRow(TODO_TITLE_EDITED);
      await row.waitFor({ state: 'hidden' });
    })

    test('It should edit title and press Enter', async () => {
      await editInput.press('Enter');
      await expect(todoText).toBeVisible();
      await expect(todoText).toHaveText(TODO_TITLE_EDITED);
    });

    test('It should edit title and press Escape', async () => {
      await editInput.press('Escape');
      await expect(todoText).toBeVisible();
      await expect(todoText).toHaveText(TODO_TITLE_EDITED);
    });

    test('It should edit title and blur', async () => {
      await todoPage.blur();
      await expect(todoText).toBeVisible();
      await expect(todoText).toHaveText(TODO_TITLE_EDITED);
    });
  });
  test('It should keep previous title if user save with empty title', async () => {
    await todoPage.addTodo(TODO_TITLE_EDITED);
    await editButton.click();
    await editInput.clear();
    await editInput.press('Enter');
    await expect(todoText).toHaveText(TODO_TITLE_EDITED);
  });
})