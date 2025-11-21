import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_LANG, isSupportedLang, SUPPORTED_LANG } from '../config/i18n.config';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { SupportedLang } from '../models/supported-lang.model';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private readonly _langKey$ = 'lang';
  private readonly _supportedLang$ = new BehaviorSubject(SUPPORTED_LANG);
  private readonly _currentLang$ = new BehaviorSubject<SupportedLang>('FR_fr');

  readonly supportedLang$ = this._supportedLang$.asObservable();
  readonly currentLang$ = this._currentLang$.asObservable();

  constructor(
    private readonly translateService: TranslateService,
    private readonly location: Location,
  ) {
    const params = new URLSearchParams(this.location.path());
    const lang = params.get(this._langKey$);
    if (!lang || !isSupportedLang(lang)) {
      this.use(DEFAULT_LANG)
    } else {
      this.use(lang);
    }
  }

  use(lang: SupportedLang) {
    this._currentLang$.next(lang);
    this.translateService.use(lang);
    this.location.replaceState('', `?${this._langKey$}=${lang}`);
  }
}
