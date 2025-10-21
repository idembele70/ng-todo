import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, catchError, combineLatest, delay, EMPTY, finalize, fromEvent, race, Subject, switchMap, take, takeUntil, timer } from "rxjs";
import { SpinnerDirective } from "../../directives/spinner.directive";
import { CompleteTodoEvent } from "../../models/complete-todo-event.model";
import { EditTodoTitleEvent } from "../../models/edit-todo-title-event.model";
import { PaginationInfo } from "../../models/paginated-todos.model";
import { Todo } from "../../models/todo.model";
import { ToggleEditStartEvent } from '../../models/toggle-edit-start-event.model';
import { TodoService } from '../../services/todo.service';
import { todoTitleExistsValidator } from '../../validators/todo-title-exists.validator';
import { DeleteTodoEvent, TodoTableRowComponent } from "../todo-table-row/todo-table-row.component";
import { NotificationService } from './../../services/notification.service';

@Component({
  selector: 'app-todo-table',
  standalone: true,
  imports: [TranslatePipe, TodoTableRowComponent, NgFor, AsyncPipe, NgIf, SpinnerDirective],
  templateUrl: './todo-table.component.html',
  styleUrl: './todo-table.component.scss'
})
export class TodoTableComponent implements OnInit, OnDestroy {
  private readonly todoService = inject(TodoService);
  private readonly renderer = inject(Renderer2);
  private readonly notificationService = inject(NotificationService)
  private readonly _destroy$ = new Subject<void>();
  private readonly _statusChangeSubscription$ = new Subject<void>();

  todos: Todo[] = [];
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };
  searchingId: number | null = null;
  
  readonly isProcessing$ = this.todoService.isProcessing$;
  readonly loading$ = new BehaviorSubject(false);

  private readonly ANIMATION_TIMEOUT = 2_000;

  ngOnInit(): void {
    this.loading$.next(true)
    this.todoService.refreshTodos(1).pipe(
      take(1),
      finalize(() => this.loading$.next(false)),
    ).subscribe();

    combineLatest([
      this.todoService.paginationInfo$,
      this.todoService.todos$,
    ])
      .pipe(
        takeUntil(this._destroy$),
      )
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
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
    this._statusChangeSubscription$.next();
    this._statusChangeSubscription$.complete();
  }

  onToggleComplete(ev: CompleteTodoEvent) {
    const prefix = 'todoTable.row.checkboxLabel';
    const key = ev.complete ? 'unCompleted' : 'completed';

    this.todoService.toggleTodoCompletion$(ev).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.todoService.setProcessing(false)),
    ).subscribe();
  }

  onToggleEditStart({ state, control, cdr, id }: ToggleEditStartEvent) {
    this._statusChangeSubscription$.next();

    this.todoService.setProcessing(state);
    control.addAsyncValidators(todoTitleExistsValidator(this.todoService));

    control.statusChanges.pipe(
      takeUntil(this._statusChangeSubscription$),
      switchMap((status) => {
        this.searchingId = status === 'PENDING' ? id : null;
        cdr.markForCheck();
        if (status === 'INVALID' && control.hasError('titleExists'))
          return this.notificationService.notifyError('addTodoForm.input.existing');
        return EMPTY;
      }),
    ).subscribe();
  }

  onEditTitle(content: EditTodoTitleEvent) {
    if (content.invalidChange) {
      this.todoService.setProcessing(false);
      return;
    }

    const prefix = 'todoTable.row.title.editInput';
    this.todoService.editTodoTitle$(content).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix)),
      finalize(() => this.todoService.setProcessing(false)),
    ).subscribe();
  }

  private animateRemoval$(el: HTMLTableRowElement) {
    this.renderer.addClass(el, 'leaving');
    return race(
      fromEvent(el, 'animationend').pipe(take(1)),
      timer(this.ANIMATION_TIMEOUT),
    );
  }
}
