import { NavigationNode } from '@dependencies';
import _ from 'lodash';
import { useState } from 'react';

export const processNavigationItems = ({
  allMdx: { distinct: navigation, group: navigationGroups },
}: NavigationQuery): NavigationNode[] =>
  navigation.map((title, navIndex) => ({
    title,
    path: `/${_.trim(
      navigationGroups[navIndex].nodes[0].frontmatter?.path || '',
      '/',
    )
      .split('/')
      .shift()}`,
    children:
      navigationGroups[navIndex].nodes.length > 1
        ? navigationGroups[navIndex].nodes.reduce(
            (children, { frontmatter, fileAbsolutePath }) => {
              if (frontmatter?.title && frontmatter?.path) {
                children.push({
                  title: frontmatter.title,
                  path: frontmatter.path,
                });
              } else {
                console.warn(`Missing title or path in ${fileAbsolutePath}`);
              }
              return children;
            },
            [] as NavigationNode[],
          )
        : undefined,
  }));

export const useMobileMenu = (): [boolean, () => void] => {
  const [status, set] = useState<boolean>(false);
  return [status, () => set(!status)];
};

export const useSubPageMenu = (
  paths: string[],
): [Record<string, boolean>, (path: string) => void, () => void] => {
  const initial = _.reduce(
    paths,
    (acc, path) => _.merge(acc, { [path]: false }),
    {},
  );
  const [state, set] = useState<Record<string, boolean>>(initial);
  const setPath = (path: string) => {
    set(_.merge({}, initial, { [path]: true }));
  };
  const close = () => {
    set(_.merge({}, initial));
  };
  return [state, setPath, close];
};
