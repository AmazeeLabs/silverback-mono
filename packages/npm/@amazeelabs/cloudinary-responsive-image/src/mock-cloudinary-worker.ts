import { mockCloudinaryImage, parseCloudinaryUrl } from './worker-lib';

function assertFetchEvent(event: Event): asserts event is FetchEvent {
  if (!(event instanceof FetchEvent)) {
    throw new Error('Expected FetchEvent');
  }
}
self.addEventListener('fetch', async (event) => {
  assertFetchEvent(event);
  const info = parseCloudinaryUrl(event.request.url);
  if (!info || !info.applies) {
    // No need to handle this request.
    return;
  }
  event.respondWith(
    mockCloudinaryImage(event.request.url).then(
      (blob) =>
        new Response(blob, {
          headers: {
            'Content-Type': 'image/jpg',
          },
        }),
    ),
  );
});
