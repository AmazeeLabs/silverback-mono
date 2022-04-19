import { ArgsEnhancer } from '@storybook/csf';
import { DecoratorFn, ReactFramework, StoryObj } from '@storybook/react';
import { Form as FormComponent, Formik } from 'formik';
import { isArray, isObject, mapValues } from 'lodash';
import React, {
  ComponentProps,
  JSXElementConstructor,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Form,
  FormBuilderProps,
  Image,
  ImageProps,
  Link,
  LinkProps,
} from './types';
import {
  buildHtmlBuilder,
  buildUrlBuilder,
  FormikChanges,
  FormikInitialValues,
  LayoutProps,
  OrganismMap,
  OrganismStatus,
  OrganismStatusProvider,
  Route,
} from './utils';

type Location = {
  pathname?: string;
  params?: URLSearchParams;
  hash?: string;
};

export type ActionsContext = {
  wouldNavigate: (to: string) => void;
  wouldSubmit: (values: any) => void;
  location?: Location;
};

const ActionsContext = React.createContext<ActionsContext>({
  wouldNavigate: () => undefined,
  wouldSubmit: () => undefined,
  location: undefined,
});

export const argTypes = {
  wouldSubmit: { action: 'would-submit' },
  wouldNavigate: { action: 'would-navigate' },
};

export function createLocation(uri: string): Location {
  const url = new URL(uri, 'http://fake');
  return {
    pathname: url.pathname,
    hash: url.hash.replace(/^#/, ''),
    params: new URLSearchParams(url.search),
  };
}

export function useLocation() {
  return useContext(ActionsContext).location;
}

const ActionsWrapper = ({
  wouldNavigate,
  wouldSubmit,
  children,
  location: initialLocation,
}: PropsWithChildren<ActionsContext>) => {
  const eventBoundary = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<Location | undefined>(
    initialLocation,
  );

  useEffect(() => {
    const boundary = eventBoundary.current;
    const handleNavigation = (event: Event) => {
      if (event instanceof CustomEvent) {
        wouldNavigate(event.detail);
        setLocation(createLocation(event.detail));
      }
    };

    const handleSubmission = (event: Event) => {
      if (event instanceof CustomEvent) {
        wouldSubmit(event.detail);
      }
    };
    boundary?.addEventListener('would-navigate', handleNavigation);
    boundary?.addEventListener('would-submit', handleSubmission);
    return () => {
      boundary?.removeEventListener('would-navigate', handleNavigation);
      boundary?.removeEventListener('would-submit', handleSubmission);
    };
  }, [eventBoundary, setLocation, wouldNavigate, wouldSubmit]);
  return (
    <ActionsContext.Provider
      value={{
        wouldSubmit,
        wouldNavigate,
        location,
      }}
    >
      <div id="storybook-event-boundary" ref={eventBoundary}>
        {children}
      </div>
    </ActionsContext.Provider>
  );
};

export const ActionsDecorator: DecoratorFn = (story, context) => {
  return (
    <ActionsWrapper
      wouldNavigate={context.args?.wouldNavigate}
      wouldSubmit={context.args?.wouldSubmit}
      location={createLocation(context.parameters?.initialLocation || '/')}
    >
      {story(context)}
    </ActionsWrapper>
  );
};

export function buildLink<Query = {}>({
  href,
  segments,
  query,
  queryOptions,
  ...props
}: LinkProps<Query>): Link<Query> {
  const buildUrl = buildUrlBuilder(segments || [href], query, queryOptions);

  const Element: Link = function StorybookLinkBuilder({
    className,
    activeClassName,
    query: queryOverride,
    fragment,
    children,
  }) {
    const target = buildUrl(queryOverride, fragment);
    return (
      <a
        href={target}
        onClick={(ev) => {
          ev.preventDefault();
          document.getElementById('storybook-event-boundary')?.dispatchEvent(
            new CustomEvent('would-navigate', {
              detail: target,
            }),
          );
        }}
        className={
          target?.includes('active')
            ? [className, activeClassName].filter((c) => !!c).join(' ')
            : className
        }
        {...props}
      >
        {children}
      </a>
    );
  };
  Element.navigate = (opts) => {
    const target = buildUrl(opts?.query, opts?.fragment);
    document.getElementById('storybook-event-boundary')?.dispatchEvent(
      new CustomEvent('would-navigate', {
        detail: target,
      }),
    );
  };
  Element.href = buildUrl();
  return Element as Link<Query>;
}

export const buildImage = (props: ImageProps): Image => {
  const Element: Image = function StorybookImageBuilder({ className }) {
    return <img {...props} className={className} />;
  };
  Element.src = props.src;
  return Element;
};

export const buildHtml = buildHtmlBuilder(buildLink);

export function buildForm<Values>({
  onChange,
  useInitialValues,
  onSubmit,
  ...formikProps
}: FormBuilderProps<Values>): Form<Values> {
  return function StorybookFormBuilder({ children, ...formProps }) {
    return (
      <Formik
        onSubmit={(values, formikHelpers) => {
          onSubmit?.(values, formikHelpers);
          document.getElementById('storybook-event-boundary')?.dispatchEvent(
            new CustomEvent('would-submit', {
              detail: values,
            }),
          );
        }}
        {...formikProps}
      >
        <FormComponent {...formProps}>
          {onChange ? <FormikChanges onChange={onChange} /> : null}
          {useInitialValues ? (
            <FormikInitialValues useInitialValues={useInitialValues} />
          ) : null}
          {children}
        </FormComponent>
      </Formik>
    );
  };
}

type SlotDefinitions<T extends JSXElementConstructor<LayoutProps<any>>> = {
  [Property in keyof ComponentProps<T>]: Placeholder;
};

export type LayoutStory<T extends JSXElementConstructor<LayoutProps<any>>> =
  Omit<StoryObj<SlotDefinitions<T>>, 'args'> & { args: SlotDefinitions<T> };

export type MoleculeStory<T extends JSXElementConstructor<any>> = Omit<
  StoryObj<ComponentProps<T>>,
  'play' | 'args'
  > & {
  // This is needed because storybook typing makes all arguments optional,
  // but we want clear indication that the component will fail.
  args: ComponentProps<T>;
  play?: StoryObj<
    ComponentProps<T> & {
    wouldNavigate: () => {};
    wouldSubmit: () => {};
  }
    >['play'];
};

const colors = {
  gray: '#F3F4F6',
  red: '#FEE2E2',
  yellow: '#FEF3C7',
  green: '#D1FAE5',
  blue: '#DBEAFE',
  indigo: '#E0E7FF',
  purple: '#EDE9FE',
  pink: '#FCE7F3',
};

type Placeholder =
  | [string, keyof typeof colors]
  | [string, keyof typeof colors, number];

/**
 * React component rendering a colored placeholder.
 *
 * To be used in storybook stories to showcase layout regions.
 *
 * @param id
 * @param children
 * @param color
 * @param height
 * @constructor
 */
export const Placeholder = ({
  id,
  children,
  color,
  height,
}: PropsWithChildren<{
  id: string;
  color: keyof typeof colors;
  height?: number;
}>) => {
  return (
    <div
      data-testid={id}
      style={{
        backgroundColor: !color ? undefined : colors[color],
        height: height || 200,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          width: '100%',
          fontStyle: 'italic',
          fontWeight: 'bold',
          color: '#374151',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const layoutArgsEnhancer: ArgsEnhancer<ReactFramework> = ({
  id,
  initialArgs,
}) => {
  if (id.match(/^elements-layouts-/)) {
    return enhanceLayoutArgs(initialArgs);
  }
  return initialArgs;
};

export const enhanceLayoutArgs = (args: SlotDefinitions<any>) => {
  return Object.keys(args)
    .map((slot) => ({
      [slot]: (
        <Placeholder id={slot} color={args[slot][1]} height={args[slot][2]}>
          {args[slot][0]}
        </Placeholder>
      ),
    }))
    .reduce((acc, val) => ({ ...acc, ...val }), {});
};

const OrganismWrapper = ({
  useMockedBehaviour,
  Story,
  context,
}: PropsWithChildren<{
  useMockedBehaviour: (props: any) => [any, OrganismStatus];
  Story: any;
  context: any;
}>) => {
  const [data, status] = useMockedBehaviour(context.args);
  return (
    <OrganismStatusProvider status={status}>
      {Story({ args: { ...context.args, ...data } })}
    </OrganismStatusProvider>
  );
};

export const OrganismDecorator: DecoratorFn = (Story, context) => {
  if (context.parameters.useMockedBehaviour) {
    return (
      <OrganismWrapper
        useMockedBehaviour={context.parameters.useMockedBehaviour}
        Story={Story}
        context={context}
      />
    );
  } else {
    return Story(context);
  }
};

/**
 * A list of organism key and prop definitions to be passed into a layout property.
 */
type OrganismStoryList<T extends OrganismMap> = Array<
  {
    [Property in keyof T]: {
      key: Property;
      story: OrganismStory<T[Property]>;
    };
  }[keyof T]
>;

export type OrganismStory<T extends JSXElementConstructor<any>> = Omit<
  StoryObj<ComponentProps<T>>,
  'args' | 'play'
> & {
  // This is needed because storybook typing makes all arguments optional,
  // but we want clear indication that the component will fail.
  args: ComponentProps<T>;
  parameters?: StoryObj<ComponentProps<T>>['parameters'] & {
    initialLocation?: string;
    useMockedBehaviour?: (
      props: ComponentProps<T>,
    ) => [ComponentProps<T>, OrganismStatus];
  };
  play?: StoryObj<
    ComponentProps<T> & {
      wouldNavigate: () => {};
      wouldSubmit: () => {};
    }
  >['play'];
};

type RouteStoryArgs<TRoute extends Route<any, any>> = {
  [Property in keyof TRoute[1]]: TRoute[1][Property] extends OrganismMap
    ? OrganismStoryList<TRoute[1][Property]>
    : TRoute[1][Property] extends JSXElementConstructor<any>
    ? OrganismStory<TRoute[1][Property]>
    : never;
};

export type RouteStory<TRoute extends Route<any, any>> = Omit<
  StoryObj<RouteStoryArgs<TRoute>>,
  'args'
> & {
  parameters?: {
    initialLocation?: string;
  };
  args: RouteStoryArgs<TRoute>;
};

function isOrganismStoryList(input: any): input is OrganismStoryList<any> {
  return isArray(input);
}

function isOrganismStory(input: any): input is OrganismStory<any> {
  return isObject(input);
}

function mockedBehaviour(story: OrganismStory<any>) {
  return story.parameters?.useMockedBehaviour
    ? () => story.parameters?.useMockedBehaviour!(story.args)
    : story.args;
}

export function renderRouteStory<TRoute extends Route<any, any>>(
  RouteDefinition: TRoute,
  Wrapper: any = {
    render: ({ children }: PropsWithChildren<{}>) => children,
    args: {},
  },
) {
  return function RouteRender({
    children,
    ...input
  }: PropsWithChildren<RouteStoryArgs<TRoute>>) {
    const routeValues = mapValues(input, (organismProps) => {
      if (isOrganismStoryList(organismProps)) {
        return organismProps.map((organism) => {
          return {
            key: organism.key,
            input: mockedBehaviour(organism.story),
          };
        });
      } else if (isOrganismStory(organismProps)) {
        return mockedBehaviour(organismProps);
      }
      return {};
    });

    return (
      <Wrapper.render {...Wrapper.args}>
        <Route
          definition={RouteDefinition}
          input={routeValues}
          intl={{ locale: 'en' }}
        >
          {children}
        </Route>
      </Wrapper.render>
    );
  };
}
