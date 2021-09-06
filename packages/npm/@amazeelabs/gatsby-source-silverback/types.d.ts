export type SilverbackPageContext = {
  typeName: string;
  id: string;
  remoteId: string;
  locale?: string;
  localizations?: Array<{
    path: string;
    locale: string;
  }>;
};
