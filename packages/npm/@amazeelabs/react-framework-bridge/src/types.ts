import { FormikConfig, FormikFormProps, FormikValues } from 'formik';
import { Element } from 'html-react-parser';
import { stringify } from 'qs';
import React from 'react';

export type ClassFunction = (domNode: Element) => string | null;

export type Html = React.VFC<{
  classNames?: {
    [key: string]: string | ClassFunction;
  };
}> & {
  initialHtmlString: string;
};

export type HtmlBuilder = (input: string) => Html;

export type Image = React.VFC<{
  className?: string;
}> & {
  src: string | undefined;
};

export type ImageProps = Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'className'
> & { alt: string };

export type ImageBuilder = (props: ImageProps) => Image;

export type Link<Query extends Parameters<typeof stringify>[0] = {}> =
  React.FC<{
    children?: React.ReactNode;
    className?: string;
    activeClassName?: string;
    query?: Query;
    fragment?: string;
  }> & {
    navigate: (opts?: { query?: Query; fragment?: string }) => void;
    href: string;
  };

export type LinkProps<Query extends Parameters<typeof stringify>[0] = {}> =
  Omit<
    React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    'className' | 'href'
  > &
    Partial<
      Pick<
        React.DetailedHTMLProps<
          React.AnchorHTMLAttributes<HTMLAnchorElement>,
          HTMLAnchorElement
        >,
        'href'
      >
    > & {
      segments?: Array<string | null | undefined>;
      query?: Query;
      queryOptions?: Parameters<typeof stringify>[1];
    };

export type LinkBuilder<T = {}> = (props: LinkProps<T>) => Link;

export type Form<Values extends FormikValues> = React.FC<
  Omit<FormikFormProps, 'target' | 'action'> &
    Partial<Pick<FormikConfig<Values>, 'children'>>
>;

export type FormBuilderProps<Values extends FormikValues> = Omit<
  FormikConfig<Values>,
  'onSubmit'
> &
  Partial<Pick<FormikConfig<Values>, 'onSubmit'>> & {
    onChange?: (values: Partial<Values>) => void;
    useInitialValues?: () => Partial<Values> | undefined;
  };
