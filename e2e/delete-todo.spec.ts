import test, { expect } from "@playwright/test";
import { TodoPage } from "./pages/todo.page";

test.describe('Todo Deletion', () => {
  let todoPage: TodoPage;
  const EMPTY_TODO_COUNT = 0;

  test.beforeEach(async ({ page }) => {
    await TodoPage.resetDB();
    todoPage = new TodoPage(page);

    await todoPage.goto();
  });
  
  test('It should delete a single todo successfully', async () => {
    const title = 'todo to delete title';
    
    await todoPage.addTodo(title);
    await todoPage.todoTable.deleteTodoBtn(title).click();

    await expect(todoPage.todoTable.todoRow).toHaveCount(EMPTY_TODO_COUNT);
  });
})