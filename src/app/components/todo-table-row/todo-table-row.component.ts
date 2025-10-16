import { DatePipe, NgIf } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { interval, Subject, takeUntil, tap } from 'rxjs';
import { CompleteTodoEvent } from '../../models/complete-todo-event.model';
import { EditTodoTitleEvent } from '../../models/edit-todo-title-event.model';
import { Todo } from '../../models/todo.model';

export interface DeleteTodoEvent {
  readonly id: number;
  el: HTMLTableRowElement;
};

@Component({
  selector: '[app-todo-table-row]',
  standalone: true,
  imports: [TranslatePipe, DatePipe, NgIf, FormsModule],
  templateUrl: './todo-table-row.component.html',
  styleUrl: './todo-table-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoTableRowComponent implements AfterViewInit, OnDestroy, AfterViewChecked {
  @Input({ required: true }) todo!: Todo;
  @Input({ required: true }) isProcessing!: boolean;
  @Output() delete = new EventEmitter<DeleteTodoEvent>();
  @Output() toggleComplete = new EventEmitter<CompleteTodoEvent>();
  @Output() editTodoTitle = new EventEmitter<EditTodoTitleEvent>();
  @Output() isEditing = new EventEmitter<boolean>();

  @ViewChild('titleInputRef') inputRef?: ElementRef<HTMLInputElement>;

  editing = false;

  private previousTitle?: string;
  private readonly _destroy$ = new Subject<void>();
  private  unlistenMouseUp?:() => void;

  constructor(
    private readonly el: ElementRef<HTMLTableRowElement>,
    private readonly renderer: Renderer2,
  ) { }

  ngAfterViewChecked() {
    if (this.editing)
      this.inputRef?.nativeElement.focus();
  }

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
    if (this.isProcessing || this.editing) return;

    this.delete.emit({
      id: this.todo.id,
      el: this.el.nativeElement,
    });
  }

  onToggleComplete(ev: Event) {
    ev.preventDefault();
    if (this.isProcessing || this.editing) return;
    this.toggleComplete.emit({
      id: this.todo.id,
      complete: this.todo.complete ? 0 : 1,
    });
  }

  onStartEdit() {
    if (this.isProcessing || this.editing) return;
    this.editing = true;
    this.isEditing.emit(true);
    this.previousTitle = this.todo.title;
    this.unlistenMouseUp = this.renderer.listen('window', 'mouseup', (event: Event) => this.save(event));
  }

  save(ev: Event) {
    const inputElName = 'editTodoTitle';
    const target = ev.target as HTMLInputElement;
    const keyboardEvent = ev as KeyboardEvent;

    if (
      target.name === inputElName && 
       ev.type === 'keyup' &&
      !['Enter', 'Escape'].includes(keyboardEvent.key)
    ) return;

    this.unlistenMouseUp?.();
    this.editing = false;
    this.isEditing.emit(false);
    if (this?.previousTitle === this.todo.title) return;
    if (!this.todo.title) {
      this.todo.title = this.previousTitle!;
      return;
    }
    this.editTodoTitle.emit({
      id: this.todo.id,
      title: this.todo.title,
    });
  }
}
