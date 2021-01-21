import { Language } from '../constants/languages';

export type ArticleContext = {
  article: AllArticlesQuery['allDrupalArticle']['nodes'][number]['translations'][number];
  childrenImagesFromHtml: AllArticlesQuery['allDrupalArticle']['nodes'][number]['childrenImagesFromHtml'];
  otherLanguages: {
    path: string;
    language: Language;
  }[];
};
