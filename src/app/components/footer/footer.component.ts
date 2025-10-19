import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, combineLatest, finalize, Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { TodoService } from './../../services/todo.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  currentPage = 1;
  isPreviousPageDisabled = false;
  isNextPageDisabled = false;
  pageInfo = '';
  isProcessing = false;

  readonly step = 1;

  private readonly _destroy$ = new Subject<void>();
  private readonly todoService = inject(TodoService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    combineLatest([
      this.todoService.paginationInfo$,
      this.todoService.isProcessing$,
    ])
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(([pageInfo, isProcessing]) => {
        this.currentPage = pageInfo.currentPage;
        this.isPreviousPageDisabled = pageInfo.currentPage === 1;
        this.isNextPageDisabled = pageInfo.currentPage === pageInfo.totalPages;
        this.pageInfo = `Page ${pageInfo.currentPage} / ${pageInfo.totalPages}`;

        this.isProcessing = isProcessing;
      });
  }

  onNavigate(currentPage: number) {
    const prefix = 'footer';
    this.todoService.setCurrentPage(currentPage)
      .pipe(
        catchError(() => this.notificationService.notifyError(prefix)),
        finalize(() => this.todoService.setProcessing(false)),
        takeUntil(this._destroy$),
      )
      .subscribe()
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
