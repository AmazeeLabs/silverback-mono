
import { buildLink } from '@amazeelabs/react-framework-bridge/storybook';

import { NavItem } from '../../../types';

export const mockNavItems = (length: number, hasChildren: boolean): Array<NavItem> =>
  Array.from({ length }).map((_, index) => ({
    id: `${index}`,
    name: `Link #${index + 1}`,
    Link: buildLink({href:`/go-to-link-${index + 1}`}),
    children: hasChildren == true ?
      Array.from({ length }).map((_, index) => ({
        id: `${index}`,
        name: `SubNavigation Link ${index + 1}`,
        Link: buildLink({href:`/go-to-link-sub-link-${index}`}),
        children: [],
      }))
      : [],
  }));
