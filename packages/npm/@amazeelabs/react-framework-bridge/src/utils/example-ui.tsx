import React from 'react';
import { StoreApi, useStore } from 'zustand';

import { Html } from '../types';
import {
  Group,
  group,
  LayoutProps,
  OrganismProps,
  route,
  RouteInput,
  useOrganismStatus,
} from './atomic';

export function PageLayout(props: LayoutProps<'header' | 'footer'>) {
  return (
    <div>
      <header>{props.header}</header>
      <main>{props.children}</main>
      <footer>{props.footer}</footer>
    </div>
  );
}

export function ContentLayout(props: LayoutProps<'intro' | 'body'>) {
  return (
    <div>
      <div>{props.intro}</div>
      <div>{props.body}</div>
    </div>
  );
}

export function Header() {
  return <div>Header</div>;
}

export function Footer() {
  return <div>Footer</div>;
}

export function ContentHeader(props: OrganismProps<{ title: string }>) {
  return <h1>{props.title}</h1>;
}

export function SyncContent(props: OrganismProps<{ Content: Html }>) {
  return <props.Content />;
}

export function DynamicContent(
  props: OrganismProps<{ dynamicData: StoreApi<{ x: string; y: number }> }>,
) {
  const x = useStore(props.dynamicData, (state) => state.x);
  return <p>{x}</p>;
}

export function AsyncContent(props: OrganismProps<{ Content: Html }>) {
  const status = useOrganismStatus();
  return status === 200 ? <props.Content /> : <p>Loading ...</p>;
}

export function ErrorContent(props: OrganismProps<{ Content: Html }>) {
  throw new Error('Error while rendering organism.');
  return <props.Content />;
}

export function GroupedContent(
  props: OrganismProps<{
    title: string;
    content: RouteInput<typeof ContentGroup>;
  }>,
) {
  return (
    <div>
      <h2>{props.title}</h2>
      <Group definition={ContentGroup} input={props.content} />
    </div>
  );
}

export const ContentGroup = group({
  items: {
    sync: SyncContent,
    async: AsyncContent,
    error: ErrorContent,
  },
});

export const Page = route(PageLayout, {
  header: Header,
  footer: Footer,
});

export const Content = route(ContentLayout, {
  intro: ContentHeader,
  body: {
    sync: SyncContent,
    async: AsyncContent,
    error: ErrorContent,
    group: GroupedContent,
    dynamic: DynamicContent,
  },
});
