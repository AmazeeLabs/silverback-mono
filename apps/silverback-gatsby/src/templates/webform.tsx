import { SilverbackPageContext } from '@amazeelabs/gatsby-source-silverback';
import { SilverbackIframe } from '@amazeelabs/silverback-iframe/src/components/SilverbackIframe';
import { graphql, Link, navigate, PageProps } from 'gatsby';
import React from 'react';

import { StandardLayout } from '../layouts/StandardLayout';
import { LocationState } from '../types/LocationState';
import { buildMessages } from '../util/build-messages';

export const query = graphql`
  query Webform($remoteId: String!) {
    drupalWebform(remoteId: { eq: $remoteId }) {
      url
    }
  }
`;

const Webform: React.FC<
  PageProps<WebformQuery, SilverbackPageContext, LocationState>
> = ({ data, location }) => {
  const webform = data.drupalWebform!;
  return (
    <StandardLayout locationState={location.state}>
      <div>
        <Link to="/">To frontpage</Link>
      </div>
      <SilverbackIframe
        buildMessages={buildMessages}
        redirect={(url, htmlMessages) =>
          navigate(
            url,
            htmlMessages?.length
              ? {
                  state: {
                    htmlMessages,
                  },
                }
              : {},
          )
        }
        src={webform.url}
        style={{
          width: '100%',
          minWidth: '100%',
          marginLeft: '-0.25em',
          marginRight: '-0.25em',
        }}
      />
    </StandardLayout>
  );
};

export default Webform;
