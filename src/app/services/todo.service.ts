import { HttpClient } from '@angular/common/http';
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
  readonly todos$ = this._todos$.asObservable();
  private readonly _isProcessing$ = new BehaviorSubject(false);
  readonly isProcessing$ = this._isProcessing$.asObservable();

  constructor(private readonly httpClient: HttpClient) { }

  addTodo(title: string) {
    return this.httpClient.post(`${this._baseUrl}/new`, { title });
  }

  deleteTodo(id: number) {
    this.setProcessing(true);
    return this.httpClient.delete(`${this._baseUrl}/${id}`);
  }

  toggleTodoCompletion$({ id, complete }: CompleteTodoEvent) {
    this.setProcessing(true);
    return this.httpClient.put<Todo>(
      `${this._baseUrl}/${id}`,
      { complete },
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

    if(todos.length) return of(todos);

    return this.refreshTodos();
  }

  refreshTodos() {
    return this.httpClient.get<Todo[]>('/todos').pipe(
      tap(todos => this._todos$.next(todos)),
    )
  }

  setProcessing(value: boolean) {
    this._isProcessing$.next(value);
  }
}
