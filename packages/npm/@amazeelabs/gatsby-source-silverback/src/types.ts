import { GraphQLFieldResolver } from 'graphql';

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

export type SilverbackResolver = GraphQLFieldResolver<any, any>;
export type SilverbackSource<T = any> = () => Array<[string, T]>;
