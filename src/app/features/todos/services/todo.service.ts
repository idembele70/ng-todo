import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { TODO_API_PATHS_TOKEN, TodoApiPaths } from '../config/todo-api-paths.config';
import { PaginatedTodos, PaginationInfo, Todo, TodoCompletion } from '../models/todo.model';

@Injectable()
export class TodoService {
  private readonly _todos$ = new BehaviorSubject<Todo[]>([]);
  private readonly _isProcessing$ = new BehaviorSubject(false);
  private readonly _hasCompletedTodos$ = new BehaviorSubject(false);
  private readonly _paginationInfo$ = new BehaviorSubject<PaginationInfo>({
    currentPage: 1,
    totalItems: 10,
    totalPages: 1,
  });
  private readonly _refreshChanges$ = new Subject<void>();

  readonly todos$ = this._todos$.asObservable();
  readonly isProcessing$ = this._isProcessing$.asObservable();
  readonly hasCompletedTodos$ = this._hasCompletedTodos$.asObservable();
  readonly paginationInfo$ = this._paginationInfo$.asObservable();
  readonly refreshChanges$ = this._refreshChanges$.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(TODO_API_PATHS_TOKEN) private readonly apiPaths: TodoApiPaths
  ) { }

  addTodo(todo: Partial<Todo>): Observable<Todo> {
    return this.httpClient.post<{ todo: Todo }>(this.apiPaths.ADD_ONE, { todo }).pipe(
      map(responseData => responseData.todo)
    );
  }

  deleteOneTodo(id: Todo['id']): Observable<void> {
    return this.httpClient.delete<void>(this.apiPaths.DELETE_ONE + id)
      .pipe(
        tap(() => {
          this.refreshHasCompletedTodos();
          this._refreshChanges$.next();
        }),
      );
  }

  deleteAllTodos(): Observable<void> {
    return this.httpClient.delete<void>(this.apiPaths.DELETE_ALL).pipe(
      tap(() => {
        this.setHasCompletedTodos(false);
        this._refreshChanges$.next();
      }),
    );
  }

  deleteAllCompletedTodos(): Observable<void> {
    return this.httpClient.delete<void>(this.apiPaths.DELETE_ALL_COMPLETED, {
      params: {
        complete: TodoCompletion.COMPLETED,
      },
    }).pipe(
      tap(() => {
        this.setHasCompletedTodos(false);
        this._refreshChanges$.next();
      }),
    );
  }

  completeTodo(id: Todo['id']): Observable<Todo> {
    return this.httpClient.put<{ todo: Todo }>(
      this.apiPaths.COMPLETE_ONE + id,
      { complete: TodoCompletion.COMPLETED },
    ).pipe(
      tap(() => this._hasCompletedTodos$.next(true)),
      map(responseData => responseData.todo),
    );
  }

  uncompleteTodo(id: Todo['id']): Observable<Todo> {
    return this.httpClient.put<{ todo: Todo }>(
      this.apiPaths.COMPLETE_ONE + id,
      { complete: TodoCompletion.UNCOMPLETED },
    ).pipe(
      tap(() => this.refreshHasCompletedTodos()),
      map(responseData => responseData.todo)
    );
  }

  editTodoTitle({ id, title }: Partial<Todo>): Observable<Todo> {
    return this.httpClient.put<{ todo: Todo }>(
      this.apiPaths.EDIT_TITLE + id,
      { title },
    ).pipe(
      tap(() => this._refreshChanges$.next()),
      map(responseData => responseData.todo),
    );
  }

  refreshTodos(currentPage: number): Observable<PaginatedTodos> {
    const params = new HttpParams()
      .set('page', currentPage || 1);

    return this.httpClient.get<PaginatedTodos>(this.apiPaths.GET_ALL,
      {
        params,
      },
    ).pipe(
      switchMap((result) => {
        if (result.todos.length === 0 && currentPage > 1) {
          const previousPage = currentPage - 1;
          return this.setCurrentPage(previousPage);
        }
        return of(result);
      }),
      tap((result) => {
        this._paginationInfo$.next({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        });
        this._todos$.next(result.todos);
      }),
    );
  }

  refreshHasCompletedTodos(): void {
    const params = new HttpParams()
      .set('complete', 'true')
      .set('limit', 1);

    this.httpClient.get<PaginatedTodos>(this.apiPaths.GET_HAS_COMPLETED, { params })
      .pipe(
        tap((result) => this.setHasCompletedTodos(!!result.totalItems)),
      ).subscribe();
  }

  setProcessing(value: boolean) {
    this._isProcessing$.next(value);
  }

  setCurrentPage(currentPage: number) {
    return this.refreshTodos(currentPage);
  }

  todoExistsByTitle({ title }: Pick<Todo, 'title'>): Observable<boolean> {
    const params = new HttpParams()
      .set('title', title);

    return this.httpClient.get<{ exists: boolean }>(
      this.apiPaths.GET_TODO_EXISTS_BY_TITLE,
      { params }
    ).pipe(
      map(responseData => responseData.exists),
    );
  }

  setHasCompletedTodos(state: boolean): void {
    this._hasCompletedTodos$.next(state);
  }

}
