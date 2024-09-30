import React, { useEffect, useRef } from 'react';
import { retry, tap } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

export default function SimpleLog({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const appendData = (data: string) => {
    if (!ref.current) {
      return;
    }
    const isScrolledToBottom =
      ref.current.scrollHeight - ref.current.clientHeight <=
      ref.current.scrollTop + 1;

    const tempDiv = document.createElement('div');
    tempDiv.textContent = data;
    tempDiv.innerHTML = tempDiv.innerHTML.replace(
      /(https?:\/\/\S+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );

    const messageDiv = document.createElement('div');
    messageDiv.append(...tempDiv.childNodes);
    ref.current.appendChild(messageDiv);

    if (isScrolledToBottom) {
      ref.current.scrollTop = ref.current.scrollHeight;
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
            : `Very ${Array.from({ length: 80 }, () => 'very').join(' ')} long message with https://example.com link at the end`,
        );
      }, 500);
      return () => {
        clearInterval(interval);
      };
    } else {
      let isConnectionLost = false;
      const ws$ = webSocket<string>({
        url,
        deserializer: (event) => event.data,
      }).pipe(
        tap({
          next: () => {
            if (isConnectionLost) {
              isConnectionLost = false;
              appendData('[Connection restored]');
            }
          },
          error: () => {
            isConnectionLost = true;
            appendData('[Connection lost. Trying to reconnect...]');
          },
        }),
        retry({ delay: 5000 }),
      );
      const subscription = ws$.subscribe({
        next: (message) => {
          appendData(message);
        },
        error: (error) => {
          appendData(`[Error: ${error}]`);
        },
        complete: () => {
          appendData('[Connection closed]');
        },
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [url]);

  return <div ref={ref} className="simple-log"></div>;
}
