import test, { expect, Page } from "@playwright/test";
import { TodoPage } from "./pages/todo.page";

test.describe('Todo Pagination', () => {

  let page: Page;
  let todoPage: TodoPage;

  const INITIAL_TODO_COUNT = 0;
  const TODO_COUNT_AFTER_ADDITION = 11;
  const TODO_COUNT_AFTER_SINGLE_REMOVAL = 10;
  const LAST_TODO_TITLE = 'Todo 0';

  test.beforeAll(async ({ browser }) => {
    await TodoPage.resetDB();

    page = await browser.newPage();
    todoPage = new TodoPage(page);

    await todoPage.goto();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('It should display default pagination state correctly', async () => {
    await todoPage.footer.assertPreviousButtonIsDisabled();

    const currentPage = 1;
    await todoPage.footer.assertPageInfoText(currentPage, INITIAL_TODO_COUNT);

    await todoPage.footer.assertNextButtonIsDisabled();
  });

  test('It should create a second page when todos exceed page limit', async () => {
    const pageLimit = 10;
    const secondPageTodoCount = 1;
    let currentPage = 1;

    for (let i = 0; i < TODO_COUNT_AFTER_ADDITION; i++) {
      await todoPage.addTodo('Todo ' + i);
    }

    await todoPage.footer.assertPreviousButtonIsDisabled();
    await todoPage.footer.assertNextButtonIsEnabled();
    await todoPage.footer.assertPageInfoText(currentPage, TODO_COUNT_AFTER_ADDITION);
    await expect(todoPage.todoTable.todoRows).toHaveCount(pageLimit);

    currentPage = 2;
    await todoPage.footer.nextButton.click();
    await todoPage.footer.assertPageInfoText(currentPage, TODO_COUNT_AFTER_ADDITION);
    await expect(todoPage.todoTable.todoRows).toHaveCount(secondPageTodoCount);
    await todoPage.footer.assertPreviousButtonIsEnabled();
    await todoPage.footer.assertNextButtonIsDisabled();
  });

  test('It should navigate back to page 1', async () => {
    const currentPage = 1;
    await todoPage.footer.previousButton.click();
    await todoPage.footer.assertPageInfoText(currentPage, TODO_COUNT_AFTER_ADDITION);
  });

  test('It should redirect to page 1 after deleting all todos on page 2', async () => {
    let currentPage = 2;
    await todoPage.footer.nextButton.click();
    await todoPage.footer.assertNextButtonIsDisabled();
    await todoPage.footer.assertPageInfoText(currentPage, TODO_COUNT_AFTER_ADDITION);

    currentPage = 1;
    await todoPage.deleteTodo(LAST_TODO_TITLE);

    await todoPage.footer.assertPreviousButtonIsDisabled();
    await todoPage.footer.assertPageInfoText(currentPage, TODO_COUNT_AFTER_SINGLE_REMOVAL);
    await todoPage.footer.assertNextButtonIsDisabled();

    await expect(todoPage.todoTable.todoRows).toHaveCount(TODO_COUNT_AFTER_SINGLE_REMOVAL);
  });

  test('It should display empty state and redirect to page 1 after deleting all todos', async () => {
    let currentPage = 2;

    await todoPage.addTodo(LAST_TODO_TITLE);
    await todoPage.footer.nextButton.click();
    await todoPage.footer.assertPageInfoText(currentPage, TODO_COUNT_AFTER_ADDITION);
    await todoPage.header.removeAllButton.click();

    currentPage = 1;
    await todoPage.footer.assertPageInfoText(currentPage, INITIAL_TODO_COUNT);
    await expect(todoPage.todoTable.emptyRow).toBeVisible();
  });
})