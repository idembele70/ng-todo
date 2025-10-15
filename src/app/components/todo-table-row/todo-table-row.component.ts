import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2 } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { interval, Subject, takeUntil, tap } from 'rxjs';
import { CompleteTodoEvent } from '../../models/complete-todo-event.model';
import { Todo } from '../../models/todo.model';

export interface DeleteTodoEvent {
  readonly id: number;
  el: HTMLTableRowElement;
};

@Component({
  selector: '[app-todo-table-row]',
  standalone: true,
  imports: [TranslatePipe, DatePipe],
  templateUrl: './todo-table-row.component.html',
  styleUrl: './todo-table-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoTableRowComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) todo!: Todo;
  @Input({ required: true }) isProcessing!: boolean;
  @Output() delete = new EventEmitter<DeleteTodoEvent>();
  @Output() toggleComplete = new EventEmitter<CompleteTodoEvent>();

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly el: ElementRef<HTMLTableRowElement>,
    private readonly renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {

    this.renderer.addClass(this.el.nativeElement, 'entering');
    const enteringDueTime = 400;
    interval(enteringDueTime)
      .pipe(
        tap(() => this.renderer.removeClass(this.el.nativeElement, 'entering')),
        takeUntil(this._destroy$),
      ).subscribe()
  }
  
  ngOnDestroy(): void {
      this._destroy$.next();
      this._destroy$.complete();
  }

  onDeleteTodo() {
    this.delete.emit({ 
      id: this.todo.id,
      el: this.el.nativeElement,
    });
  }

  onToggleComplete(ev: Event) {
    ev.preventDefault();

    this.toggleComplete.emit({
      id: this.todo.id,
      complete: this.todo.complete ? 0 : 1,
    });
  }
}
