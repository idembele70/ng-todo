import FRfrJson from '../../src/assets/i18n/FR_fr.json';
import ENusJson from '../../src/assets/i18n/EN_us.json';

type I18n = typeof FRfrJson | typeof ENusJson;
type Lang = 'fr' | 'en';
type I18nLang = Record<Lang, I18n>; 

const lang = (process.env['E2E_LANGUAGE'] || 'fr') as Lang

const i18nLang: I18nLang = {
  fr: FRfrJson,
  en: ENusJson,
}

export const i18n = i18nLang[lang];
