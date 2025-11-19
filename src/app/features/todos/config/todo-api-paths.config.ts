import { InjectionToken } from "@angular/core";

const BASE_PATHNAME = '/todos';

export const TODO_API_PATHS = {
  ADD_ONE: `${BASE_PATHNAME}/new`,
  COMPLETE_ONE: `${BASE_PATHNAME}/`,
  DELETE_ONE: `${BASE_PATHNAME}/`,
  DELETE_ALL: BASE_PATHNAME,
  DELETE_ALL_COMPLETED: BASE_PATHNAME,
  EDIT_TITLE: `${BASE_PATHNAME}/`,
  GET_HAS_COMPLETED: BASE_PATHNAME,
  GET_ALL: BASE_PATHNAME,
  GET_TODO_EXISTS_BY_TITLE: `${BASE_PATHNAME}/exists`,
  UNCOMPLETE_ONE: `${BASE_PATHNAME}/`,
} as const;

export const TODO_API_PATHS_TOKEN = new InjectionToken<TodoApiPaths>('Todo_API_PATHS');

export type TodoApiPaths = typeof TODO_API_PATHS;
