import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, finalize, fromEvent, race, Subject, Subscription, switchMap, take, takeUntil, timer } from "rxjs";
import { NotificationService } from '../../../../core/services/notification.service';
import { SpinnerDirective } from "../../directives/spinner.directive";
import { PaginationInfo, Todo, ToggleEditStartEvent } from "../../models/todo.model";
import { TodoService } from '../../services/todo.service';
import { DeleteTodoEvent, TodoTableRowComponent } from "../todo-table-row/todo-table-row.component";
import { LoaderService } from "../../../../core/services/loader.service";
import { todoTitleExistsValidator } from "../../validators/todo-title-exists.validator";

@Component({
  selector: 'app-todo-table',
  standalone: true,
  providers: [],
  imports: [
    TranslatePipe,
    TodoTableRowComponent,
    NgFor,
    AsyncPipe,
    NgIf,
    SpinnerDirective,
  ],
  templateUrl: './todo-table.component.html',
  styleUrl: './todo-table.component.scss'
})
export class TodoTableComponent implements OnInit, OnDestroy {
  private readonly todoService = inject(TodoService);
  protected readonly loaderService = inject(LoaderService);
  private readonly renderer = inject(Renderer2);
  private readonly notificationService = inject(NotificationService)
  private readonly _destroy$ = new Subject<void>();
  private readonly _statusChangeSubscription$ = new Subject<void>();
  private readonly ANIMATION_TIMEOUT = 2_000;

  todos: Todo[] = [];
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };
  searchingId: number | null = null;
  isProcessing = false;

  ngOnInit(): void {
    this.fetchTodos();
    this.setupTodosInfo();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  trackById(_: number, todo: Todo): number { return todo.id; }

  onDeleteOneTodo({ id, el }: DeleteTodoEvent) {
    if (this.isProcessing) return;

    this.loaderService.setProcessing(true);
    const prefix = 'todoTable.row.btn.remove';
    this.todoService.deleteOneTodo(id)
      .pipe(
        switchMap(() => this.notificationService.notifySuccess(prefix)),
        switchMap(() => this.animateRemoval$(el)),
        switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
        catchError(() => this.notificationService.notifyError(prefix)),
        finalize(() => {
          this.loaderService.setProcessing(false);
        }),
      )
      .subscribe();
  }

  onCompleteOneTodo(id: Todo['id']) {
    if (this.isProcessing) return;
    this.loaderService.setProcessing(true);
    const prefix = 'todoTable.row.checkboxLabel';
    const key = 'completed';

    this.todoService.completeTodo(id).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.loaderService.setProcessing(false)),
    ).subscribe();
  }

  onUncompleteOneTodo(id: Todo['id']) {
    if (this.isProcessing) return;
    this.loaderService.setProcessing(true);
    const prefix = 'todoTable.row.checkboxLabel';
    const key = 'unCompleted';

    this.todoService.uncompleteTodo(id).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.loaderService.setProcessing(false)),
    ).subscribe();
  }

  onToggleEditStart({ state, control, cdr, id }: ToggleEditStartEvent) {
    this._statusChangeSubscription$.next();
    this.loaderService.setProcessing(state);
    control.addAsyncValidators(todoTitleExistsValidator(
      this.todoService,
    ));

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

  onEditTitle(todo: Todo) {
    if (this.isProcessing) return;
    this.todoService.setProcessing(true);

    const prefix = 'todoTable.row.title.editInput';
    this.todoService.editTodoTitle(todo).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix)),
      finalize(() => this.loaderService.setProcessing(false)),
    ).subscribe();
  }

  private animateRemoval$(el: HTMLTableRowElement) {
    this.renderer.addClass(el, 'leaving');
    return race(
      fromEvent(el, 'animationend').pipe(take(1)),
      timer(this.ANIMATION_TIMEOUT),
    );
  }

  private fetchTodos(): void {
    this.loaderService.setRefreshingTodos(true);
    this.todoService.refreshTodos(1).pipe(
      take(1),
      finalize(() => this.loaderService.setRefreshingTodos(false)),
    ).subscribe();
  }

  private setupTodosInfo(): void {
    combineLatest([
      this.todoService.paginationInfo$,
      this.todoService.todos$,
      this.loaderService.isProcessing$
    ])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([pageInfo, todos, isProcessing]) => {
        this.todos = todos;
        this.pageInfo = pageInfo;
        this.isProcessing = isProcessing;
      });
  }

  private cleanup(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._statusChangeSubscription$.next();
    this._statusChangeSubscription$.complete();
  }
}
