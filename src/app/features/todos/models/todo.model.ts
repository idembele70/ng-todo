import { ChangeDetectorRef } from "@angular/core";
import { FormControl } from "@angular/forms";

export enum TodoCompletion {
  UNCOMPLETED = 0,
  COMPLETED = 1,
};

export interface Todo {
  readonly id: number;
  title: string;
  complete: TodoCompletion;
  readonly createdAt: string;
}

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

export interface ToggleEditStartEvent {
  state: boolean;
  control: FormControl<string>;
  cdr: ChangeDetectorRef;
  id: number;
}

export interface EditTodoTitleEvent {
  id: number;
  title: string;
  invalidChange: boolean;
}
