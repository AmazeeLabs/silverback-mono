import IframeResizer, { IFrameObject } from 'iframe-resizer-react';
import React, { useRef, useState } from 'react';

import { IframeCommandOther, isIframeCommand } from '../types/iframe-command';

type OwnProps = {
  buildMessages: (htmlMessages: Array<string>) => JSX.Element | null;
  redirect: (url: string, htmlMessages?: Array<string>) => void;
};

type Props = OwnProps & IframeResizer.IframeResizerProps;

export const SilverbackIframe = ({
  buildMessages,
  redirect,
  ...iframeResizerProps
}: Props) => {
  const iframeRef = useRef<IFrameObject>(null);
  const [iframeSeed, setIframeSeed] = useState<string | null>(null);
  const [currentCommand, setCurrentCommand] = useState<IframeCommandOther>();

  return (
    <div className="silverback-iframe">
      <div className="silverback-iframe-messages">
        {(currentCommand?.action === 'displayMessages' ||
          currentCommand?.action === 'replaceWithMessages') &&
          buildMessages(currentCommand.messages)}
      </div>
      {currentCommand?.action !== 'replaceWithMessages' && (
        <IframeResizer
          {...iframeResizerProps}
          forwardRef={iframeRef}
          src={
            iframeResizerProps.src &&
            updateUrlParameters(iframeResizerProps.src, {
              iframe: 'true',
              iframeSeed: iframeSeed,
            })
          }
          onMessage={({ message }) => {
            if (!isIframeCommand(message)) {
              return;
            }
            if (message.action === 'getBaseUrl') {
              iframeRef.current?.sendMessage(
                `silverback-iframe-base-url:${window.location.origin}`,
                '*',
              );
              return;
            }
            if (message.action === 'redirect') {
              redirect(message.path, message.messages);
              // In case if redirect path is the same with the current path,
              // the redirect() call may do nothing (Gatsby case). Here we
              // change the URL of the iframe (and update the iframe contents)
              // to imitate a redirect to the same page.
              setIframeSeed(Date.now().toString());
            } else {
              setCurrentCommand(message);
            }
          }}
        />
      )}
    </div>
  );
};

const updateUrlParameters = (
  uri: string,
  parameters: Record<string, string | null>,
): string => {
  let result = uri;
  Object.entries(parameters).forEach(([key, value]) => {
    result = updateUrlParameter(result, key, value);
  });
  return result;
};

// From https://gist.github.com/niyazpk/f8ac616f181f6042d1e0#gistcomment-3797774
const updateUrlParameter = (
  uri: string,
  key: string,
  value: string | null,
): string => {
  // remove the hash part before operating on the uri
  const i = uri.indexOf('#');
  const hash = i === -1 ? '' : uri.substr(i);
  uri = i === -1 ? uri : uri.substr(0, i);

  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';

  if (value === null) {
    // remove key-value pair if value is specifically null
    uri = uri.replace(new RegExp(`([?&]?)${key}=[^&]*`, 'i'), '');
    if (uri.slice(-1) === '?') {
      uri = uri.slice(0, -1);
    }
    // replace first occurrence of & by ? if no ? is present
    if (uri.indexOf('?') === -1) uri = uri.replace(/&/, '?');
  } else if (uri.match(re)) {
    uri = uri.replace(re, `$1${key}=${value}$2`);
  } else {
    uri = `${uri + separator + key}=${value}`;
  }
  return uri + hash;
};
