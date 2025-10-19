import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, finalize, fromEvent, race, Subject, switchMap, take, takeUntil, timer } from "rxjs";
import { CompleteTodoEvent } from "../../models/complete-todo-event.model";
import { EditTodoTitleEvent } from "../../models/edit-todo-title-event.model";
import { PaginationInfo } from "../../models/paginated-todos.model";
import { Todo } from "../../models/todo.model";
import { TodoService } from '../../services/todo.service';
import { DeleteTodoEvent, TodoTableRowComponent } from "../todo-table-row/todo-table-row.component";
import { NotificationService } from './../../services/notification.service';

@Component({
  selector: 'app-todo-table',
  standalone: true,
  imports: [TranslatePipe, TodoTableRowComponent, NgFor, AsyncPipe, NgIf],
  templateUrl: './todo-table.component.html',
  styleUrl: './todo-table.component.scss'
})
export class TodoTableComponent implements OnInit, OnDestroy {
  private readonly todoService = inject(TodoService);
  private readonly renderer = inject(Renderer2);
  private readonly notificationService = inject(NotificationService)
  private readonly _destroy$ = new Subject<void>();
  
  todos: Todo[] = [];
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };

  readonly isProcessing$ = this.todoService.isProcessing$;

  private readonly ANIMATION_TIMEOUT = 2_000;

  ngOnInit(): void {
    this.todoService.refreshTodos(1).pipe(take(1)).subscribe();

    combineLatest([
      this.todoService.paginationInfo$,
      this.todoService.todos$,
    ])
    .pipe(takeUntil(this._destroy$))
    .subscribe(([pageInfo, todos]) => {
      this.todos = todos;
      this.pageInfo = pageInfo;
    });
  }

  trackById(_: number, todo: Todo) { return todo.id; }

  onDeleteTodo({ id, el }: DeleteTodoEvent) {
    const prefix = 'todoTable.row.btn.remove';
    this.todoService.deleteOneTodo$(id)
    .pipe(
      switchMap(() => this.notificationService.notifySuccess(prefix)),
      switchMap(() => this.animateRemoval$(el)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix)),
      finalize(() => {
        this.todoService.setProcessing(false);
      }),
      takeUntil(this._destroy$),
    )
    .subscribe();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onToggleComplete(ev:  CompleteTodoEvent) {
    const prefix = 'todoTable.row.checkboxLabel';
    const key = ev.complete ? 'unCompleted' : 'completed';

    this.todoService.toggleTodoCompletion$(ev).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroy$),
    ).subscribe();
  }

  onToggleEditStart(state: boolean) {
    this.todoService.setProcessing(state);
  }

  onEditTitle(content: EditTodoTitleEvent) {
    const prefix = 'todoTable.row.title.editInput';
    this.todoService.editTodoTitle$(content).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroy$),
    ).subscribe();
  }

  private animateRemoval$(el: HTMLTableRowElement) {
    this.renderer.addClass(el, 'leaving');
    return race(
      fromEvent(el, 'animationend').pipe(take(1)),
      timer(this.ANIMATION_TIMEOUT),
    )
  }
}
