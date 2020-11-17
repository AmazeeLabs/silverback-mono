import { createDependencyContext } from '@amazeelabs/react-di';

export type Link = React.FC<{
  to: string;
  className?: string;
  activeClassName?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}>;

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
