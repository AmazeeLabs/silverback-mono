import { Language, languages } from '../constants/languages';

type OtherLanguages = Array<{
  path: string;
  language: Language;
}>;

export const otherLanguages = (
  locale: string,
  translations: Array<{ langcode: string; path: string }>,
): OtherLanguages => {
  const otherLanguages: OtherLanguages = [];
  translations.forEach((translation) => {
    if (translation.langcode !== locale) {
      otherLanguages.push({
        path: translation.path,
        language: languages.find((it) => it.id === translation.langcode)!,
      });
    }
  });
  return otherLanguages;
};
