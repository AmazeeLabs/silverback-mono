import { Language } from '../constants/languages';

export type ArticleContext = {
  article: AllArticlesQuery['allDrupalArticleTranslations']['nodes'][number]['translations'][number];
  childrenImagesFromHtml: AllArticlesQuery['allDrupalArticleTranslations']['nodes'][number]['childrenImagesFromHtml'];
  otherLanguages: {
    path: string;
    language: Language;
  }[];
};

export type GutenbergPageContext = {
  page: AllGutenbergPagesQuery['allDrupalGutenbergPageTranslations']['nodes'][number]['translations'][number];
  otherLanguages: {
    path: string;
    language: Language;
  }[];
};
