import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
  ) { }

  notifySuccess(prefix: string) {
    const suffix = '.messages.success';

    return this.translate.get(`${prefix}${suffix}`).pipe(
      tap((message) => this.toastr.success(message)),
    );
  }

  notifyError(prefix: string, key?: string) {
    const suffix = '.messages.error';
    const translationKey = prefix + (key ? '.' + key : '') + suffix;

    return this.translate.get(translationKey).pipe(
      tap((message) => this.toastr.error(message)),
      switchMap(() => EMPTY),
    );
  }
}
