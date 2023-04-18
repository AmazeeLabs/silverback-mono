export function parseCloudinaryUrl(url: string) {
  const prefix = 'https://res.cloudinary.com/';
  const config = url.substring(prefix.length);
  let pos = config.indexOf('/http') + 1;
  if (pos === 0) {
    pos = config.indexOf('//') + 1;
  }
  const source = config.substring(pos);
  const match =
    /(?<cloudname>.*?)\/image\/fetch\/.*?\/f_auto\/?(?<transform>.*)/.exec(
      config.substring(0, pos - 1),
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
    src: source as string,
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
