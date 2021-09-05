export type IframeCommandGetBaseUrl = {
  action: 'getBaseUrl';
};

export type IframeCommandRedirect = {
  action: 'redirect';
  path: string;
  messages?: Array<string>;
};

export type IframeCommandOther = {
  action: 'replaceWithMessages' | 'displayMessages';
  messages: Array<string>;
};

export type IframeCommand =
  | IframeCommandGetBaseUrl
  | IframeCommandRedirect
  | IframeCommandOther;

export const isIframeCommand = (variable: any): variable is IframeCommand => {
  if (typeof variable === 'object' && typeof variable.action === 'string') {
    if (variable.action === 'getBaseUrl') {
      return true;
    }
    if (
      variable.action === 'redirect' &&
      typeof variable.path === 'string' &&
      (typeof variable.messages === 'undefined' ||
        isArrayOfStrings(variable.messages))
    ) {
      return true;
    }
    if (
      ['replaceWithMessages', 'displayMessages'].includes(variable.action) &&
      isArrayOfStrings(variable.messages)
    ) {
      return true;
    }
  }
  return false;
};

const isArrayOfStrings = (variable: any): variable is Array<string> =>
  Array.isArray(variable) && !variable.find((item) => typeof item !== 'string');
