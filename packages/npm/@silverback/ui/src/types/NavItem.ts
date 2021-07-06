import { Link } from './Link';

export type NavItem = {
  id: string;
  name: string;
  Link: Link;
  children: NavigationItems;
};

export type NavigationItems = { items: Array<NavItem> };
