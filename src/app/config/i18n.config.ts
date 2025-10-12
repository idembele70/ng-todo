import { provideTranslateService } from "@ngx-translate/core";
import { SupportedLang } from "../models/supported-lang.model";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";

export const DEFAULT_LANG: SupportedLang = 'FR_fr';
export const FALLBACK_LANG: SupportedLang = 'EN_us';
export const SUPPORTED_LANG: readonly SupportedLang[] = ['FR_fr', 'EN_us'] as const;

export const i18nProviders = [
  provideTranslateService({
    loader: provideTranslateHttpLoader({
      prefix: 'assets/i18n/',
      suffix: '.json',
    }),
    lang: DEFAULT_LANG,
    fallbackLang: FALLBACK_LANG,
  })
]