import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, finalize, Subject, takeUntil, tap } from 'rxjs';
import { LoaderService } from '../../../../core/services/loader.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TodoService } from '../../services/todo.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    TranslatePipe,
    AsyncPipe,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  private readonly todoService = inject(TodoService);
  private readonly notificationService = inject(NotificationService);
  protected readonly loaderService = inject(LoaderService);
  readonly step = 1;
  currentPage = 1;
  isPreviousPageDisabled = false;
  isNextPageDisabled = false;
  pageInfo = '';
  isProcessing = false

  ngOnInit(): void {
    this.setupObservable()
  };

  onNavigate(currentPage: number) {
    this.loaderService.setProcessing(true)
    const prefix = 'footer';
    this.todoService.setCurrentPage(currentPage)
      .pipe(
        catchError(() => this.notificationService.notifyError(prefix)),
        finalize(() => this.loaderService.setProcessing(false)),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private setupObservable(): void {
    combineLatest([
      this.todoService.paginationInfo$,
      this.loaderService.isProcessing$,
    ]).pipe(
        takeUntil(this._destroy$),
        tap(([pageInfo, isProcessing]) => {
          this.currentPage = pageInfo.currentPage;
          this.isPreviousPageDisabled = pageInfo.currentPage === 1;
          this.isNextPageDisabled = pageInfo.currentPage === pageInfo.totalPages;
          this.pageInfo = `Page ${pageInfo.currentPage} / ${pageInfo.totalPages}`;
          this.isProcessing = isProcessing;
        }),
      ).subscribe();
  }
}
