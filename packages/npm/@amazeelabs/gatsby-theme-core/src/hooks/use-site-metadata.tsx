import { graphql, useStaticQuery } from 'gatsby';

export type UseSiteMetadataProps = {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: string;
    };
  };
};

export const useSiteMetadata = () => {
  const data = useStaticQuery<UseSiteMetadataProps>(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          author
        }
      }
    }
  `);

  return data.site.siteMetadata;
};
