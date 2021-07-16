
import { NavItem } from '../../../types';
import { buildLink } from '../../../utils';

export const mockNavItems = (length: number, hasChildren: boolean): Array<NavItem> =>
  Array.from({ length }).map((_, index) => ({
    id: `${index}`,
    name: `Link #${index + 1}`,
    Link: buildLink(`/go-to-link-${index + 1}`),
    children: hasChildren == true ?
      Array.from({ length }).map((_, index) => ({
        id: `${index}`,
        name: `SubNavigation Link`,
        Link: buildLink(`/go-to-link-sub-link`),
        children: [],
      }))
      : [],
  }));
