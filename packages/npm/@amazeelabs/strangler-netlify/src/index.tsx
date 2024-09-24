import { Handler, HandlerEvent } from '@netlify/functions';

export type LegacySystem = {
  /**
   * The base url of the legacy system. The request will be forwarded to the
   * base url if Netlify does not have a page for the requested path.
   */
  url: string;
  /**
   * Check if a given URL applies to this legacy system. If not defined, the
   * legacy system will be used for all requests.
   */
  applies?: (url: URL) => boolean;
  /**
   * Alter the HandlerEvent to the legacy system.
   * If this function returns undefined, the original event will be sent.
   */
  preprocess?: (
    event: HandlerEvent,
  ) => HandlerEvent | Promise<HandlerEvent> | undefined;
  /**
   * Alter the legacy system response. If this function returns undefined, the
   * response will be ignored. If the function is not defined, the response will
   * always be returned as is.
   */
  process?: (response: Response) => Response | Promise<Response> | undefined;
};

export function createStrangler(
  legacySystems: Array<LegacySystem>,
  notFoundContent: string = '<p>Not found</p>',
) {
  const handler: Handler = async (originalEvent) => {
    // Pass the request to the legacy applications.
    for (const legacySystem of legacySystems) {
      const event =
        (await legacySystem.preprocess?.(originalEvent)) ?? originalEvent;
      const targetUrl = new URL(legacySystem.url);
      const url = new URL(event.rawUrl);
      const headers = {
        'SLB-Forwarded-Proto': url.protocol.substring(
          0,
          url.protocol.length - 1,
        ),
        'SLB-Forwarded-Host': url.host,
        'SLB-Forwarded-Port': url.port,
      };
      // Check if we even want to proxy this request.
      // Skip if the urlFilter exists and returns false.
      if (legacySystem.applies && !legacySystem.applies(url)) {
        continue;
      }
      url.protocol = targetUrl.protocol;
      url.host = targetUrl.host;
      try {
        const result = await fetch(url, {
          redirect: 'manual',
          headers: {
            ...event.headers,
            host: targetUrl.host,
            ...headers,
          },
          method: event.httpMethod,
          ...(event.body && { body: event.body }),
        });
        // Process the response if the legacy system wants to, otherwise return
        // it as is.
        const processed = legacySystem.process
          ? await legacySystem.process(result)
          : result;
        if (processed) {
          return {
            statusCode: processed.status,
            headers: Object.fromEntries(processed.headers.entries()),
            body: await processed.text(),
          };
        }
      } catch (e) {
        console.error(e);
        return {
          statusCode: 404,
          body: notFoundContent,
        };
      }
    }
    return {
      statusCode: 404,
      body: notFoundContent,
    };
  };
  return handler;
}
