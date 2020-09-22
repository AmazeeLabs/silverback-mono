import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import oceanicNext from 'prism-react-renderer/themes/oceanicNext';
import React from 'react';

export const Code: React.FC<{
  codeString: string;
  language: Language;
}> = ({ codeString, language }) => (
  <Highlight
    {...defaultProps}
    theme={oceanicNext}
    code={codeString}
    language={language}
  >
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);
