import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly _isProcessing$ = new BehaviorSubject(false);
  private readonly _isRefreshingTodos$ = new BehaviorSubject(false);
  
  readonly isProcessing$ = this._isProcessing$.asObservable();
  readonly isRefreshingTodos$ = this._isRefreshingTodos$.asObservable();

  setProcessing(state: boolean): void {
    this._isProcessing$.next(state);
  }

  setRefreshingTodos(state: boolean): void {
    this._isRefreshingTodos$.next(state);
  }
}
