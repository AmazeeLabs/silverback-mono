export function parseCloudinaryUrl(url: string) {
  const match =
    /https:\/\/res\.cloudinary\.com\/(?<cloudname>.*?)\/image\/fetch\/.*?\/f_auto\/(?<transform>.*?)(?<src>((\/\/.*|\/https?:.*)))/.exec(
      url,
    );
  if (!match) {
    return undefined;
  }
  const chain = match.groups!.transform.split('/');
  let width: number | undefined;
  let height: number | undefined;
  const transforms = [];
  for (const transform of chain) {
    for (const operation of transform.split(',')) {
      // TODO: dimension prediction does not take chained transforms into account
      if (operation.startsWith('w_')) {
        width = parseInt(operation.substring(2));
      } else if (operation.startsWith('h_')) {
        height = parseInt(operation.substring(2));
      } else {
        transforms.push(operation);
      }
    }
  }
  return {
    debug: match.groups!.cloudname === 'debug',
    src: match.groups!.src.substring(1) as string,
    transform: match.groups!.transform as string,
    width,
    height,
  };
}

export function drawDimensions(
  imageWidth: number,
  imageHeight: number,
  targetWidth: number | undefined,
  targetHeight: number | undefined,
) {
  const imageRatio = imageWidth / imageHeight;
  const containerWidth = targetWidth || imageWidth;
  const containerHeight = targetHeight || containerWidth / imageRatio;
  const containerRatio = containerHeight
    ? containerWidth / containerHeight
    : imageRatio;
  const drawWidth =
    imageRatio < containerRatio ? containerWidth : containerHeight * imageRatio;
  const drawHeight =
    imageRatio < containerRatio ? containerWidth / imageRatio : containerHeight;
  return [drawWidth, drawHeight];
}
