import { createDependencyContext } from '../utils/di';

export type Link = React.FC<{
  to: string;
  className?: string;
  activeClassName?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}>;

export type FrameworkDependencies = {
  Link: Link;
  navigate: (to: string) => void;
  SEO: React.FC<{ title?: string }>;
};

export const [
  FrameworkDependencyProvider,
  FrameworkDependencyOverride,
  useFrameworkDependencies,
] = createDependencyContext<FrameworkDependencies>();

export type NavigationNode = {
  title: string;
  path: string;
  children?: NavigationNode[];
};

export type DataDependencies = {
  useNavigation: () => NavigationNode[];
};

export const [
  DataDependencyProvider,
  DataDependencyOverride,
  useDataDependencies,
] = createDependencyContext<DataDependencies>();
