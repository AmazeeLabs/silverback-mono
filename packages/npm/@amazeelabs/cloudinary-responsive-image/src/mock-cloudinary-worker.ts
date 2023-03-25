import { drawDimensions, parseCloudinaryUrl } from './worker-lib';

function assertFetchEvent(event: Event): asserts event is FetchEvent {
  if (!(event instanceof FetchEvent)) {
    throw new Error('Expected FetchEvent');
  }
}
self.addEventListener('fetch', async (event) => {
  assertFetchEvent(event);
  const info = parseCloudinaryUrl(event.request.url);
  if (!info) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(info.src)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        return createImageBitmap(blob);
      })
      .then((bitmap) => {
        const imageRatio = bitmap.width / bitmap.height;
        const containerWidth = info.width || bitmap.width;
        const containerHeight = info.height || containerWidth / imageRatio;
        const canvas = new OffscreenCanvas(containerWidth, containerHeight);
        const ctx = canvas.getContext(
          '2d',
        ) as unknown as CanvasRenderingContext2D;
        const [drawWidth, drawHeight] = drawDimensions(
          bitmap.width,
          bitmap.height,
          info.width,
          info.height,
        );
        ctx.drawImage(
          bitmap,
          (containerWidth - drawWidth) / 2,
          (containerHeight - drawHeight) / 2,
          drawWidth,
          drawHeight,
        );
        if (info.debug) {
          const indicatorHeight = 50;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(20, 20, containerWidth - 40, indicatorHeight);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${containerWidth} x ${containerHeight}`,
            containerWidth / 2,
            22 + indicatorHeight / 2,
            containerWidth - 20,
          );
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.rect(5, 5, containerWidth - 10, containerHeight - 10);
          ctx.stroke();
        }
        // @ts-ignore
        return canvas.convertToBlob().then(
          // @ts-ignore
          (blob) =>
            new Response(blob, {
              headers: {
                'Content-Type': 'image/jpg',
              },
            }),
        );
      }),
  );
});
