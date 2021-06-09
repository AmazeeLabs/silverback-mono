import { Language } from '../constants/languages';

export type ArticleContext = {
  remoteId: string;
  langcode: string;
  otherLanguages: {
    path: string;
    language: Language;
  }[];
};

export type GutenbergPageContext = {
  remoteId: string;
  langcode: string;
  otherLanguages: {
    path: string;
    language: Language;
  }[];
};
