import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, EMPTY, finalize, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LoaderService } from '../../../../core/services/loader.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SpinnerDirective } from '../../directives/spinner.directive';
import { PaginationInfo, Todo } from '../../models/todo.model';
import { SanitizeTodoTitlePipe } from '../../pipes/sanitize-todo-title.pipe';
import { TodoService } from '../../services/todo.service';
import { todoTitleExistsValidator } from '../../validators/todo-title-exists.validator';
import { TitleInputComponent } from "../title-input/title-input.component";


@Component({
  selector: 'app-add-form',
  standalone: true,
  providers: [
  ],
  imports: [
    TranslatePipe,
    FormsModule,
    SpinnerDirective,
    ReactiveFormsModule,
    TitleInputComponent
  ],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss'
})
export class AddFormComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly _destroy$ = new Subject<void>();
  protected readonly todoTitle = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(1),
    ],
    asyncValidators: [
      todoTitleExistsValidator(this.todoService),
    ]
  });
  isProcessing!: boolean;

  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };


  constructor(
    private readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.listenToRefreshForInputValidation();
    this.observeProcessingAndPagination();
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  ngAfterViewInit(): void {
    this.todoTitleStatusChangesListener();
  }


  onAddTodo(e: Event) {
    e.preventDefault();
    if (this.todoTitle.invalid ||
      this.todoTitle.pending ||
      this.isProcessing) return;
    this.loaderService.setProcessing(true);
    const inputPrefix = 'addTodoForm.input';
    const title = this.todoTitle.value;
    if (!title) {
      const notificationSub = this.notificationService.notifyError(`${inputPrefix}.whitespace`)
        .pipe(takeUntil(this._destroy$))
        .subscribe();
      notificationSub.unsubscribe();
      return;
    }

    const buttonPrefix = 'addTodoForm.button';
    this.todoService.addTodo({ title })
      .pipe(
        switchMap(() => this.notificationService.notifySuccess(buttonPrefix)),
        switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
        tap(() => this.todoTitle.reset()),
        catchError(() => this.notificationService.notifyError(buttonPrefix)),
        finalize(() => {
          this.loaderService.setProcessing(false);
        }),
      )
      .subscribe();
  }

  private listenToRefreshForInputValidation(): void {
    this.todoService.refreshChanges$
      .pipe(
        tap(() => {
          if (!this.todoTitle.value.trim()) return;
          this.todoTitle.updateValueAndValidity({ emitEvent: false });
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private observeProcessingAndPagination(): void {
    combineLatest([
      this.loaderService.isProcessing$,
      this.todoService.paginationInfo$,
    ])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([isProcessing, pageInfo]) => {
        this.isProcessing = isProcessing;
        this.pageInfo = pageInfo;
      });
  }

  private todoTitleStatusChangesListener(): void {
    this.todoTitle.statusChanges.pipe(
      switchMap((status) => {
        this.notificationService.clearNotification();
        if (status !== 'PENDING') {
          this.loaderService.setProcessing(false);
        }
        if (status === 'INVALID' && this.todoTitle.hasError('titleExists')) {
          return this.notificationService.notifyError('addTodoForm.input.existing');
        }
        return EMPTY;
      }),
      takeUntil(this._destroy$),
    ).subscribe();
  }

  private teardown() {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
