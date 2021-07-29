import { PageProps } from 'gatsby';
import React from 'react';

import { SilverbackPageContext } from '../../types';

const StubTemplate = ({
  pageContext: { remoteId, typeName, expectedTemplatePath },
}: PageProps<{}, SilverbackPageContext & { expectedTemplatePath: string }>) => {
  return (
    <pre>
      This is a stub page for {typeName} {remoteId}
      <br />
      <br />
      Create {expectedTemplatePath} with a component for it.
    </pre>
  );
};

export default StubTemplate;
