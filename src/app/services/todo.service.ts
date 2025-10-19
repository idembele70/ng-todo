import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { CompleteTodoEvent } from '../models/complete-todo-event.model';
import { EditTodoTitleEvent } from '../models/edit-todo-title-event.model';
import { PaginatedTodos, PaginationInfo } from '../models/paginated-todos.model';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly _todos$ = new BehaviorSubject<Todo[]>([]);
  private readonly _baseUrl = '/todos';
  private readonly _isProcessing$ = new BehaviorSubject(false);
  private readonly _hasCompletedTodos$ = new BehaviorSubject(false);
  private readonly _paginationInfo$ = new BehaviorSubject<PaginationInfo>({
    currentPage: 1,
    totalItems: 10,
    totalPages: 1,
  });

  readonly todos$ = this._todos$.asObservable();
  readonly isProcessing$ = this._isProcessing$.asObservable();
  readonly hasCompletedTodos$ = this._hasCompletedTodos$.asObservable();
  readonly paginationInfo$ = this._paginationInfo$.asObservable();

  constructor(private readonly httpClient: HttpClient) { }

  addTodo(title: string) {
    return this.httpClient.post(`${this._baseUrl}/new`, { title });
  }

  deleteOneTodo$(id: number): Observable<void> {
    this.setProcessing(true);
    return this.httpClient.delete<void>(`${this._baseUrl}/${id}`)
      .pipe(
        tap(() => this.refreshHasCompletedTodos())
      );
  }

  deleteAllTodos$(complete: boolean): Observable<void> {
    this.setProcessing(true);
    return this.httpClient.delete<void>(`${this._baseUrl}`, {
      params: {
        complete,
      },
    }).pipe(
      tap(() => this._hasCompletedTodos$.next(false)),
    );
  }

  toggleTodoCompletion$({ id, complete }: CompleteTodoEvent) {
    this.setProcessing(true);
    return this.httpClient.put<Todo>(
      `${this._baseUrl}/${id}`,
      { complete },
    ).pipe(
      tap(() => this.refreshHasCompletedTodos())
    );
  }

  editTodoTitle$({ id, title }: EditTodoTitleEvent): Observable<Todo> {
    this.setProcessing(true);

    return this.httpClient.put<Todo>(
      `${this._baseUrl}/${id}`,
      { title },
    );
  }

  fetchTodos() {
    const todos = this._todos$.value;

    if (todos.length) return of(todos);

    this.refreshHasCompletedTodos();
    return this.refreshTodos(1);
  }

  refreshTodos(currentPage: number): Observable<PaginatedTodos> {
    const params = new HttpParams()
      .set('page', currentPage || 1);

    return this.httpClient.get<PaginatedTodos>('/todos',
      {
        params,
      },
    ).pipe(
      switchMap((result) => {
        if (result.todos.length === 0 && currentPage > 1) {
          const previousPage = currentPage - 1;
          this.setCurrentPage(previousPage);
          return this.refreshTodos(previousPage);
        }
        return of(result);
      }),
      tap((result) => {
        this._paginationInfo$.next({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        });
      }),
      tap(result => this._todos$.next(result.todos)),
    );
  }

  refreshHasCompletedTodos(): void {
    this.setProcessing(true);
    const params = new HttpParams()
      .set('complete', 'true')
      .set('limit', 1);

    this.httpClient.get<PaginatedTodos>(this._baseUrl, { params })
      .pipe(
        tap((result) => this._hasCompletedTodos$.next(!!result.totalItems)),
      ).subscribe();
  }

  setProcessing(value: boolean) {
    this._isProcessing$.next(value);
  }

  setCurrentPage(currentPage: number) {
    this.setProcessing(true);

    return this.refreshTodos(currentPage);
  }
}
