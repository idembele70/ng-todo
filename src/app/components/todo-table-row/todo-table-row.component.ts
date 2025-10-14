import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { interval, Subject, takeUntil, tap } from 'rxjs';
import { Todo } from '../../models/todo.model';

@Component({
  selector: '[app-todo-table-row]',
  standalone: true,
  imports: [TranslatePipe, DatePipe],
  templateUrl: './todo-table-row.component.html',
  styleUrl: './todo-table-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoTableRowComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) todo!: Todo;
  private readonly _destroy$ = new Subject<void>();

  constructor(private readonly el: ElementRef, private readonly renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.addClass(this.el.nativeElement, 'entering');
    const enteringDueTime = 400;
    interval(enteringDueTime)
      .pipe(
        takeUntil(this._destroy$),
        tap(() => this.renderer.removeClass(this.el.nativeElement, 'entering')),
      ).subscribe()
  }

  ngOnDestroy(): void {
      this._destroy$.next();
      this._destroy$.complete();
  }
}
