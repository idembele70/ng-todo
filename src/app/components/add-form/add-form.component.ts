import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, EMPTY, finalize, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SpinnerDirective } from '../../directives/spinner.directive';
import { PaginationInfo } from '../../models/paginated-todos.model';
import { TodoService } from '../../services/todo.service';
import { todoTitleExistsValidator } from '../../validators/todo-title-exists.validator';
import { NotificationService } from './../../services/notification.service';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [TranslatePipe, FormsModule, SpinnerDirective],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss'
})
export class AddFormComponent implements OnInit, OnDestroy, AfterViewInit {
  todoName: string = '';
  isProcessing!: boolean;
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };

  private readonly _destroy$ = new Subject<void>();
  private readonly _statusChangeSubscription$ = new Subject<void>();

  @ViewChild('todoInput', { static: true }) readonly todoInput!: NgModel;


  constructor(
    private readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.todoService.isProcessing$,
      this.todoService.paginationInfo$,
    ])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([isProcessing, pageInfo]) => {
        this.isProcessing = isProcessing;
        this.pageInfo = pageInfo;
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._statusChangeSubscription$.next();
    this._statusChangeSubscription$.complete();
  }

  ngAfterViewInit(): void {
    this._statusChangeSubscription$.next();

    const todoInputControl = this.todoInput.control;
    if (!todoInputControl) return;

    todoInputControl.setAsyncValidators(todoTitleExistsValidator(this.todoService));

    todoInputControl.statusChanges.pipe(
      switchMap((status) => {
        if (status !== 'PENDING')
          this.todoService.setProcessing(false);

        if (status === 'INVALID' && this.todoInput.hasError('titleExists'))
          return this.notificationService.notifyError('addTodoForm.input.existing');
        return EMPTY;
      }),
      takeUntil(this._statusChangeSubscription$),
    ).subscribe();
  }

  onAddTodo(e: Event) {
    e.preventDefault();
    if (this.isProcessing || ['PENDING', 'INVALID'].includes(this.todoInput.status as string)) return;

    const inputPrefix = 'addTodoForm.input';
    const trimmedName = this.todoName.trim();
    if (!trimmedName) {
      this.notificationService.notifyError(`${inputPrefix}.whitespace`)
        .pipe(takeUntil(this._destroy$))
        .subscribe();
      return;
    }

    const buttonPrefix = 'addTodoForm.button';
    this.todoService.addTodo(trimmedName)
      .pipe(
        switchMap(() => this.notificationService.notifySuccess(buttonPrefix)),
        switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
        tap(() => this.todoName = ''),
        catchError(() => this.notificationService.notifyError(buttonPrefix)),
        finalize(() => {
          this.todoService.setProcessing(false);
          this.todoInput.reset();
        }),
      )
      .subscribe();
  }
}
