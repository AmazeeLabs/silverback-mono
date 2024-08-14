import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, open, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { sep } from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';

import { imageDimensionsFromData } from 'image-dimensions';
import { cache, PropsWithChildren } from 'react';
import sharp from 'sharp';

import {
  calculateFocusExtraction,
  defaultImageSettings,
  Dimensions,
  Focus,
  ImageProps,
  ImageSettings as ImageSettingsType,
  inferTargetDimensions,
} from './lib.js';

async function prepareFile(src: string) {
  const alterSrc = getSettings().alterSrc;
  const url = alterSrc ? alterSrc(src) : src;
  if (url.match(/https?:\/\//)) {
    const dir = await mkdtemp(`${tmpdir}${sep}`);
    const tmpFileName = `${dir}/${createHash('md5').update(url).digest('hex')}`;
    try {
      const fd = await open(tmpFileName);
      await fd.close();
    } catch (err) {
      try {
        const result = await fetch(url);
        const fileStream = createWriteStream(tmpFileName, { flags: 'wx' });
        if (result.body) {
          await finished(Readable.fromWeb(result.body as any).pipe(fileStream));
        } else {
          throw `Unable to download ${url}.`;
        }
      } catch (err) {
        throw `Unable to download ${url}.`;
      }
    }
    return tmpFileName;
  } else {
    return `${getSettings().staticDir}/${url}`;
  }
}

async function createDerivative(
  filename: string,
  source: Dimensions,
  target: Dimensions,
  focus: Focus | undefined,
) {
  const outputDir = getSettings().outputDir;
  const outputPath = getSettings().outputPath;
  const fn = `${createHash('md5')
    .update(JSON.stringify({ ...target, filename, focus }))
    .digest('hex')}.jpg`;

  const derivative = `${outputDir}/${fn}`;
  await mkdir(outputDir, { recursive: true });
  try {
    const fd = await open(derivative);
    await fd.close();
  } catch (err) {
    const img = await readFile(filename);
    const pipeline = sharp(img);
    if (focus) {
      pipeline.extract(
        calculateFocusExtraction(
          [source.width, source.height],
          [target.width, target.height],
          focus,
        ),
      );
    }
    pipeline.resize(target.width, target.height, {
      fit: 'cover',
      position: sharp.strategy.attention,
    });
    const resized = await pipeline.toFormat('jpg').toBuffer();
    await writeFile(derivative, resized);
  }
  return `${outputPath}/${fn}`;
}

async function transformSrc(
  filename: string,
  source: Dimensions,
  target: Dimensions,
  focus: Focus | undefined,
) {
  return await createDerivative(filename, source, target, focus);
}

async function transformSrcSet(
  filename: string,
  source: Dimensions,
  target: Dimensions,
  breakpoints: Array<number>,
  focus: [number, number] | undefined,
) {
  const sources = [];
  for (const width of breakpoints) {
    sources.push(
      `${await transformSrc(filename, source, { width, height: Math.round((target.height / target.width) * width) }, focus)} ${width}w`,
    );
  }
  return sources.join(', ');
}

async function intrinsicDimensions(filename: string): Promise<Dimensions> {
  const dim = imageDimensionsFromData(await readFile(filename));
  if (!dim) {
    throw `Unable to determine dimensions of ${filename}.`;
  }
  return dim;
}

function serverContext<T>(defaultValue: T): [() => T, (v: T) => void] {
  const getRef = cache(() => ({ current: defaultValue }));

  const getValue = (): T => getRef().current;

  const setValue = (value: T) => {
    getRef().current = value;
  };

  return [getValue, setValue];
}

const [getSettings, setSettings] =
  serverContext<ImageSettingsType>(defaultImageSettings);

export function useImageSettings() {
  return getSettings();
}

export function ImageSettings({
  children,
  ...settings
}: PropsWithChildren<Partial<ImageSettingsType>>) {
  setSettings({ ...defaultImageSettings, ...settings });
  return <>{children}</>;
}

export async function Image({
  width,
  height,
  focus,
  priority,
  ...props
}: ImageProps) {
  if (!props.src) {
    return <img {...props} width={width} height={height} />;
  }
  const filename = await prepareFile(props.src);
  const source = await intrinsicDimensions(filename);
  const target = inferTargetDimensions(source, width, height);
  return (
    <img
      {...props}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'async' : 'auto'}
      // eslint-disable-next-line react/no-unknown-property
      fetchPriority={priority ? 'high' : 'auto'}
      src={await transformSrc(filename, source, target, focus)}
      srcSet={await transformSrcSet(
        filename,
        source,
        target,
        [
          target.width,
          target.width * 2,
          ...getSettings().resolutions.filter((w) => w < target.width),
        ],
        focus,
      )}
      sizes={props.sizes || `(min-width: ${width}px) ${width}px, 100vw`}
      data-src={props.src}
      style={{ maxWidth: '100%', objectFit: 'cover', ...props.style }}
    />
  );
}
