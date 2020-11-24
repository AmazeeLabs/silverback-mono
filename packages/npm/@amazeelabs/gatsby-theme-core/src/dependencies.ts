import { createDependencyContext } from '@amazeelabs/react-di';
import { Link, navigate } from 'gatsby';

export type GatsbyDependencies = {
  Link: typeof Link;
  navigate: typeof navigate;
};

const [Provider, Override, useDependencies] = createDependencyContext<
  GatsbyDependencies
>();

export const DependencyProvider = Provider;
export const DependencyOverride = Override;
export const useGatsbyDependencies = useDependencies;
