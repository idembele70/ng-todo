import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID, Provider } from '@angular/core';

registerLocaleData(localeFr);

export const localeProviders: Provider[] = [
  { provide: LOCALE_ID, useValue: 'fr-FR'},
];