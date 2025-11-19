import { Todo } from "../models/todo.model";

export const FIXED_DATE_TIME = String(new Date('2025-10-17').getTime());


export const uncompletedTodoMock: Todo = {
  id: 1,
  title: 'first uncomplete todo',
  complete: 0,
  createdAt: FIXED_DATE_TIME,
};

export const completedTodoMock: Todo = {
  id: 2,
  title: 'complete todo 1',
  complete: 1,
  createdAt: FIXED_DATE_TIME,
};

const todosMock = [
  uncompletedTodoMock,
  completedTodoMock,
];

export const todoIdsMock = todosMock.map(t => t.id);
