import { Todo } from './todo.model';

export interface PaginatedTodos {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  todos: Todo[];
}

export type PaginationInfo = Pick<PaginatedTodos,
  | 'currentPage'
  | 'totalPages'
  | 'totalItems'>;