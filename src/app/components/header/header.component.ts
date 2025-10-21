import { AsyncPipe, NgForOf } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, finalize, of, Subject, switchMap, takeUntil } from 'rxjs';
import { PaginationInfo } from '../../models/paginated-todos.model';
import { LangService } from '../../services/lang.service';
import { NotificationService } from '../../services/notification.service';
import { TodoService } from '../../services/todo.service';
import { ExtractCountryPipe } from "../../pipes/extract-country.pipe";
import { FormsModule, NgModel } from "@angular/forms";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslatePipe, NgForOf, AsyncPipe, ExtractCountryPipe, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isProcessing: boolean = false;
  hasTodos: boolean = false;
  hasCompletedTodos: boolean = false;
  pageInfo: PaginationInfo = {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  };

  private readonly _destroy$ = new Subject<void>();
  readonly currentLang$ = this.langService.currentLang$;
  readonly availableLang$ = this.langService.supportedLang$;

  @ViewChild('langSelectModel', { static: true }) readonly langSelectModel!: NgModel;

  constructor(
    readonly todoService: TodoService,
    private readonly notificationService: NotificationService,
    private readonly langService: LangService,
  ) { }
  
  ngOnInit(): void {
    const valueChanges$ = this.langSelectModel.valueChanges ?? of(this.currentLang$);

    combineLatest([
      this.todoService.isProcessing$,
      this.todoService.todos$,
      this.todoService.hasCompletedTodos$,
      this.todoService.paginationInfo$,
      valueChanges$
    ]).pipe(
      takeUntil(this._destroy$),
    ).subscribe(([isProcessing, todos, hasCompletedTodos, pageInfo, selectedValue]) => {
      this.isProcessing = isProcessing;
      this.hasTodos = !!todos.length;
      this.hasCompletedTodos = hasCompletedTodos;
      this.pageInfo = pageInfo;
      this.langService.use(selectedValue);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onDeleteAllTodos(completed: boolean) {
    if (!this.hasTodos || this.isProcessing) return;

    const prefix = 'header.clear';
    const key = completed ? 'completed' : 'all';

    this.todoService.deleteAllTodos$(completed).pipe(
      switchMap(() => this.notificationService.notifySuccess(`${prefix}.${key}`)),
      switchMap(() => this.todoService.refreshTodos(this.pageInfo.currentPage)),
      catchError(() => this.notificationService.notifyError(prefix, key)),
      finalize(() => this.todoService.setProcessing(false)),
      takeUntil(this._destroy$),
    ).subscribe();
  }
}
