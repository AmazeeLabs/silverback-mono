import React from 'react';

export const buildMessages = (htmlMessages: Array<string>) => (
  <div className="status-messages-inner">
    {htmlMessages.map((htmlMessage, index) => (
      <div key={index} dangerouslySetInnerHTML={{ __html: htmlMessage }} />
    ))}
  </div>
);
