import { mockCloudinaryImage } from './worker-lib';

function assertFetchEvent(event: Event): asserts event is FetchEvent {
  if (!(event instanceof FetchEvent)) {
    throw new Error('Expected FetchEvent');
  }
}
self.addEventListener('fetch', async (event) => {
  assertFetchEvent(event);
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
