import React, { useEffect, useRef } from 'react';

export default function SimpleLog({ url }: { url: string }) {
  const logRef = useRef<HTMLDivElement | null>(null);

  const appendData = (data: string) => {
    if (!logRef.current) {
      return;
    }
    const isScrolledToBottom =
      logRef.current.scrollHeight - logRef.current.clientHeight <=
      logRef.current.scrollTop + 1;
    const messageElement = document.createElement('div');
    messageElement.textContent = data;
    logRef.current.appendChild(messageElement);
    if (isScrolledToBottom) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (url === '__storybook__') {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        appendData(
          i % 5
            ? `Message ${i}`
            : `Very ${Array.from({ length: 80 }, () => 'very').join(' ')} long message`,
        );
      }, 500);
      return () => {
        clearInterval(interval);
      };
    } else {
      const socket = new WebSocket(url);
      socket.onmessage = (event) => {
        appendData(event.data);
      };
      // TODO: Handle errors. Maybe: reconnect on error.
      return () => {
        socket.close();
      };
    }
  }, [url]);

  return (
    <div
      ref={logRef}
      style={{ overflow: 'auto', height: '100%' }}
      className="simple-log"
    ></div>
  );
}
