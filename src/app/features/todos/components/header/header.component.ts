import { AsyncPipe, NgForOf } from "@angular/common";
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, distinctUntilChanged, finalize, pipe, Subject, switchMap, take, takeUntil } from 'rxjs';
import { SupportedLang } from "../../../../core/models/supported-lang.model";
import { LangService } from '../../../../core/services/lang.service';
import { LoaderService } from "../../../../core/services/loader.service";
import { NotificationService } from '../../../../core/services/notification.service';
import { PaginationInfo } from '../../models/todo.model';
import { ExtractCountryPipe } from "../../pipes/extract-country.pipe";
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TranslatePipe,
    NgForOf,
    AsyncPipe,
    ExtractCountryPipe,
    ReactiveFormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly _destroy$ = new Subject<void>();
  private readonly _destroyDeleteAllTodoSubscription$ = new Subject<void>();
  protected readonly langSelect = new FormControl<SupportedLang>('FR_fr', { nonNullable: true });
  readonly currentLang$ = this.langService.currentLang$;
  readonly availableLang$ = this.langService.supportedLang$;
  isProcessing: boolean = false;
  hasTodos: boolean = false;
  hasCompletedTodos: boolean = false;
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };

  constructor(
    private readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
    private readonly langService: LangService,
    private readonly loaderService: LoaderService,
  ) { }

  ngAfterViewInit() {
    this.setupLangListeners();
  }

  ngOnInit(): void {
    this.todoService.refreshHasCompletedTodos();
    this.setupObservableListener();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  onDeleteAllTodos() {
    this._destroyDeleteAllTodoSubscription$.next();
    if (!this.hasTodos || this.isProcessing) return;
    this.todoService.deleteAllTodos().pipe(
      this.deleteAllPipe('all'),
    ).subscribe();
  }

  onDeleteAllCompletedTodos() {
    this._destroyDeleteAllTodoSubscription$.next();
    if (!this.hasTodos || this.isProcessing) return;
    this.todoService.deleteAllCompletedTodos().pipe(
      this.deleteAllPipe('completed')
    ).subscribe();
  }

  private deleteAllPipe(key: string) {
    this._destroyDeleteAllTodoSubscription$.next();
    const prefix = 'header.clear';
    return pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroyDeleteAllTodoSubscription$),
    )
  }

  private setupObservableListener(): void {
    combineLatest([
      this.loaderService.isProcessing$.pipe(distinctUntilChanged()),
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

  private setupLangListeners(): void {
    this.langService.currentLang$
      .pipe(take(1)).subscribe(defaultLang => {
        this.langSelect.setValue(defaultLang);
      });
    this.langSelect.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(selectedValue => {
        this.langService.use(selectedValue);
      })
  }

  private cleanup() {
    this._destroy$.next();
    this._destroy$.complete();
    this._destroyDeleteAllTodoSubscription$.next();
    this._destroyDeleteAllTodoSubscription$.complete();
  }
}
