import { AsyncPipe, NgForOf } from "@angular/common";
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from "@angular/forms";
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, distinctUntilChanged, finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { PaginationInfo } from '../../models/paginated-todos.model';
import { ExtractCountryPipe } from "../../pipes/extract-country.pipe";
import { LangService } from '../../services/lang.service';
import { NotificationService } from '../../services/notification.service';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslatePipe, NgForOf, AsyncPipe, ExtractCountryPipe, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isProcessing: boolean = false;
  hasTodos: boolean = false;
  hasCompletedTodos: boolean = false;
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };

  private readonly _destroy$ = new Subject<void>();
  private readonly _destroyDeleteAllTodoSubscription$ = new Subject<void>();
  readonly currentLang$ = this.langService.currentLang$;
  readonly availableLang$ = this.langService.supportedLang$;

  @ViewChild('langSelectModel') readonly langSelectModel!: NgModel;

  constructor(
    readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
    private readonly langService: LangService,
  ) { }

  ngAfterViewInit() {
    if (!this.langSelectModel?.valueChanges) return;

    this.langSelectModel.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(selectedValue => {
        this.langService.use(selectedValue);
      })
  }

  ngOnInit(): void {
    combineLatest([
      this.todoService.isProcessing$.pipe(distinctUntilChanged()),
      this.todoService.todos$.pipe(distinctUntilChanged()),
      this.todoService.hasCompletedTodos$.pipe(distinctUntilChanged()),
      this.todoService.paginationInfo$.pipe(distinctUntilChanged()),
    ]).pipe(
      takeUntil(this._destroy$),
    ).subscribe(([isProcessing, todos, hasCompletedTodos, pageInfo]) => {
      this.isProcessing = isProcessing;
      this.hasTodos = !!todos.length;
      this.hasCompletedTodos = hasCompletedTodos;
      this.pageInfo = pageInfo;
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._destroyDeleteAllTodoSubscription$.next();
    this._destroyDeleteAllTodoSubscription$.complete();
  }

  onDeleteAllTodos(completed: boolean) {
    this._destroyDeleteAllTodoSubscription$.next();

    if (!this.hasTodos || this.isProcessing) return;

    const prefix = 'header.clear';
    const key = completed ? 'completed' : 'all';

    this.todoService.deleteAllTodos$(completed).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroyDeleteAllTodoSubscription$),
    ).subscribe();
  }
}
