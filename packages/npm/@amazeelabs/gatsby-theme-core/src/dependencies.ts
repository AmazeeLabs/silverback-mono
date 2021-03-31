import { createDependencyContext } from '@amazeelabs/react-di';
import { Link, navigate } from 'gatsby';
import { GatsbyImage, StaticImage } from 'gatsby-plugin-image';

export type GatsbyDependencies = {
  Link: typeof Link;
  navigate: typeof navigate;
  GatsbyImage: typeof GatsbyImage;
  StaticImage: typeof StaticImage;
};

const [
  Provider,
  Override,
  useDependencies,
] = createDependencyContext<GatsbyDependencies>();

export const DependencyProvider = Provider;
export const DependencyOverride = Override;
export const useGatsbyDependencies = useDependencies;
