import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { CompleteTodoEvent } from '../models/complete-todo-event.model';
import { EditTodoTitleEvent } from '../models/edit-todo-title-event.model';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly _todos$ = new BehaviorSubject<Todo[]>([]);
  private readonly _baseUrl = '/todos';
  private readonly _isProcessing$ = new BehaviorSubject(false);
  private readonly _hasCompletedTodos$ = new BehaviorSubject(false);

  readonly todos$ = this._todos$.asObservable();
  readonly isProcessing$ = this._isProcessing$.asObservable();
  readonly hasCompletedTodos$ = this._hasCompletedTodos$.asObservable();

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

    this.refreshHasCompletedTodos()
    return this.refreshTodos();
  }

  refreshTodos() {
    return this.httpClient.get<Todo[]>('/todos').pipe(
      tap(todos => this._todos$.next(todos)),
    )
  }

  refreshHasCompletedTodos(): void {
    this.setProcessing(true);
    const params = new HttpParams()
      .set('complete', 'true')
      .set('limit', 1);

    this.httpClient.get<Todo[]>(this._baseUrl, { params })
      .pipe(
        tap((completedTodos) => this._hasCompletedTodos$.next(!!completedTodos.length)),
      ).subscribe();
  }

  setProcessing(value: boolean) {
    this._isProcessing$.next(value);
  }
}
