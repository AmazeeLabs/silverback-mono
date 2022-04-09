import { isArray, isFunction, isObject, mapValues } from 'lodash';
import React, {
  ComponentProps,
  JSXElementConstructor,
  PropsWithChildren,
  ReactNode,
  useContext,
} from 'react';
import { IntlProvider } from 'react-intl';

import { Form, Html, Image, Link } from '../types';

export type Primitive =
  | number
  | string
  | null
  | undefined
  | boolean
  | Html
  | Link
  | Image
  | Form<any>;

export type Struct = {
  [key: string]: Data;
};

export type Data = Primitive | Struct | Array<Primitive> | Array<Struct>;

/**
 * Reserved property names that should not be used in layouts.
 */
type ReservedProperties =
  // Standard property to pass in the react-intl configuration.
  'intl';

export type LayoutProps<TSlots extends Exclude<string, ReservedProperties>> =
  PropsWithChildren<{
    [Slot in TSlots]?: ReactNode;
  }>;

export type LayoutComponent = JSXElementConstructor<LayoutProps<any>>;

/**
 * A status code number that describes the state of the current request.
 *
 * By convention either 0 for "did nothing yet" or an appropriate HTTP status
 * code: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 *
 * Popular choices and how the UI should react:
 *
 * 0: I didn't do anything yet -> idle state, "please enter a search request"
 * 102: Hold on, I'm getting or updating data -> show loading indication
 * 200: All good, here is your data -> render the UI
 * 400: The request parameters are broken -> invalid form input?
 * 401: Need to authorize -> display login?
 * 403: You are not allowed to do that -> probably a problem with the UI
 * 404: Does not exist / no results -> show "not found" or "empty list" message
 * 500: Something broke on the backend -> we are really sorry, the error has been reported!
 * 503: Can't even connect -> are you connected to the internet?
 */
export type OrganismStatus = number;

const OrganismStatusContext = React.createContext<OrganismStatus>(200);

export const useOrganismStatus = () => useContext(OrganismStatusContext);

export const OrganismStatusProvider = ({
  children,
  status,
}: PropsWithChildren<{ status: OrganismStatus }>) => (
  <OrganismStatusContext.Provider value={status}>
    {children}
  </OrganismStatusContext.Provider>
);

export type Mappers<
  TInput extends Array<{ __typename: TKey }>,
  TOptions extends RouteSlotInput<any, any>,
  TKey extends string = string,
> = Partial<{
  [Property in TInput[number]['__typename']]: (
    input: Extract<TInput[number], { __typename: Property }>,
  ) => TOptions;
}>;

export function createMapper<
  TInput extends Array<{ __typename: TKey }>,
  TOptions extends RouteSlotInput<any, any>,
  TKey extends string = string,
>(mappers: Mappers<TInput, TOptions>) {
  return function (input: TInput) {
    return input
      .filter((item) => {
        if (!mappers[item.__typename]) {
          console.error(`No mapper defined for ${item.__typename}`);
          return false;
        }
        return true;
      })
      .map((item) => {
        // @ts-ignore
        return mappers[item.__typename]!(item);
      });
  };
}

/**
 * Organisms think in dictionaries where the keys are strings and the values
 * are primitives or data structures.
 */
export type OrganismProps<T extends { [key: string]: any }> = {
  [Property in keyof T]: T[Property];
};

export type RouteInput<TRoute extends Route<any, any>> = RouteInputs<
  RouteProps<TRoute[1]>
>;

export type RouteSlotInput<
  TRoute extends Route<any, any>,
  Slot extends keyof Omit<ComponentProps<TRoute[0]>, 'children'>,
  TKeys extends TRoute[1][Slot] extends OrganismMap
    ? keyof TRoute[1][Slot]
    : never = any,
> = TRoute[1][Slot] extends OrganismMap
  ? OrganismPropsList<TRoute[1][Slot]> extends Array<infer TItem>
    ? TItem extends { key: TKeys; props: OrganismProps<any> }
      ? { key: TItem['key']; input: OrganismInput<TItem['props']> }
      : never
    : never
  : TRoute[1][Slot] extends OrganismComponent
  ? OrganismInput<ComponentProps<TRoute[1][Slot]>>
  : never;

/**
 * An organism react component.
 */
export type OrganismComponent = JSXElementConstructor<OrganismProps<any>>;

/**
 * A hook function that returns an organisms props and data.
 */
type OrganismAsyncInput<T extends OrganismProps<any>> = () => [
  T,
  OrganismStatus,
];

/**
 * Organism input can either bei static props or async input.
 */
type OrganismInput<T extends OrganismProps<any>> = T | OrganismAsyncInput<T>;

function isOrganismAsyncInput(
  input: OrganismInput<any>,
): input is OrganismAsyncInput<any> {
  return isFunction(input);
}

/**
 * Wrap any OrganismInput in a closure to make sure its async.
 *
 * @param input
 */
function toHook<T extends OrganismProps<any>>(
  input: OrganismInput<T>,
): OrganismAsyncInput<T> {
  return isOrganismAsyncInput(input) ? input : () => [input, 200];
}

/**
 * A map of organisms that can be injected into a layout slot.
 */
export type OrganismMap = {
  [key: string]: JSXElementConstructor<any>;
};

/**
 * A list of organism key and prop definitions to be passed into a layout property.
 */
type OrganismPropsList<T extends OrganismMap> = Array<
  {
    [Property in keyof T]: {
      key: Property;
      props: ComponentProps<T[Property]>;
    };
  }[keyof T]
>;

/**
 * A list of organism inputs. Turn the props into either props or hooks.
 */
type OrganismInputList<TList extends OrganismPropsList<any>> =
  TList extends Array<infer TItem>
    ? Array<
        TItem extends { key: keyof OrganismMap; props: OrganismProps<any> }
          ? { key: TItem['key']; input: OrganismInput<TItem['props']> }
          : never
      >
    : never;

/**
 * A mapping of either Organism components or Organism maps to slots of a given
 * layout component.
 */
type LayoutMap<TLayoutComponent extends LayoutComponent> = {
  [Property in keyof Omit<ComponentProps<TLayoutComponent>, 'children'>]:
    | OrganismComponent
    | OrganismMap;
};

/**
 * The organism property collection required to render a route.
 */
export type RouteProps<TLayoutMap extends LayoutMap<LayoutComponent>> = {
  [Property in keyof TLayoutMap]: TLayoutMap[Property] extends OrganismMap // If the property is an OrganismMap...
    ? // ... then the route property has to be an organism property list
      OrganismPropsList<TLayoutMap[Property]>
    : // ... else we are dealing with a standard organism component.
    TLayoutMap[Property] extends OrganismComponent
    ? OrganismProps<TLayoutMap[Property]>
    : never;
};

/**
 * Static or async inputs for a given route.
 */
type RouteInputs<TRouteProps extends RouteProps<any>> = {
  [Property in keyof TRouteProps]: TRouteProps[Property] extends OrganismPropsList<any>
    ? OrganismInputList<TRouteProps[Property]>
    : TRouteProps extends OrganismProps<any>
    ? OrganismInput<TRouteProps[Property]>
    : never;
};

export type Route<
  TLayoutComponent extends LayoutComponent,
  TLayoutMap extends LayoutMap<TLayoutComponent>,
> = [TLayoutComponent, TLayoutMap];

export function route<
  TLayoutComponent extends LayoutComponent,
  TLayoutMap extends LayoutMap<TLayoutComponent>,
>(
  Component: TLayoutComponent,
  layoutMap: TLayoutMap,
): [TLayoutComponent, TLayoutMap] {
  return [Component, layoutMap];
}

function withOrganismProps<T extends OrganismProps<any>>(
  Component: JSXElementConstructor<T>,
) {
  return function OrganismHost(input: OrganismInput<T>, index: number) {
    const [data, status] = toHook(input)();
    return (
      <OrganismStatusProvider status={status} key={index}>
        <Component {...data} />
      </OrganismStatusProvider>
    );
  };
}

function isOrganismMap(
  input: OrganismMap | OrganismComponent,
): input is OrganismMap {
  return isObject(input);
}

/**
 * Render a route.
 *
 * @param Route
 * @param input
 * @param intl
 */
export function Route<
  TLayoutComponent extends LayoutComponent,
  TLayoutMap extends LayoutMap<TLayoutComponent>,
>({
  definition,
  input,
  intl,
  children,
}: PropsWithChildren<{
  definition: Route<TLayoutComponent, TLayoutMap>;
  input: RouteInputs<RouteProps<TLayoutMap>>;
  intl: ComponentProps<typeof IntlProvider>;
}>) {
  return (
    <IntlProvider {...intl}>
      {React.createElement(
        definition[0],
        mapValues(definition[1], (entry, key) => {
          const organismProps = input[key];
          if (isOrganismMap(entry) && isArray(organismProps)) {
            return organismProps.map((organism, index) => {
              return withOrganismProps(
                entry[organism.key as keyof typeof entry],
              )((organism as OrganismInput<any>).input, index);
            });
          } else if (isFunction(entry)) {
            return withOrganismProps(entry)(input[key], 0);
          }
        }),
        children,
      )}
    </IntlProvider>
  );
}
