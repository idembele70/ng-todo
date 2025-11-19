import { Todo } from "../models/todo.model";
import { FIXED_DATE_TIME } from "./todo.mock";

export function createTodo(overrides: Partial<Todo>): Todo {
  return {
    id: 1,
    title: 'default title',
    complete: 0,
    createdAt: FIXED_DATE_TIME,
    ...overrides
  }
}

export function createMockResponse(overrides?: Partial<Todo>): Todo {
  return {
    id: 1,
    title: 'mock title',
    complete: 0,
    createdAt: FIXED_DATE_TIME,
    ...overrides
  }
}