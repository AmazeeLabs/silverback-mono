import clsx from 'clsx';
import {
  createContext,
  HTMLAttributes,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

/**
 * Defines a single image source.
 * Tuple of URL and intrinsinc width in pixels.
 */
type ImageSource = [string, number];

/**
 * Set of additional image sources.
 */
type ImageSourceSet = {
  /**
   * Media query to determine the appropriate set.
   */
  media: string;
  /**
   * List of sources bundled in this set.
   */
  srcSet: Array<ImageSource>;
};

/**
 * Defines a single image size hint.
 * Tuple of a media query and the slot width
 * in either viewport units or pixesl
 */
type ImageSize =
  | [string, `${number}${'vw' | 'px'}`]
  | `${number}${'vw' | 'px'}`;

function RealPicture(props: HTMLAttributes<HTMLPictureElement>) {
  return <picture {...props} />;
}

type ImageProps = PropsWithChildren<{
  /**
   * The original images URL.
   */
  src: string;

  /**
   * The images alternative text.
   */
  alt: string;

  /**
   * Lazy load the image. Defaults to `true`,
   * should be disabled for critical images above the fold.
   */
  lazy?: boolean;

  /**
   * Display layout strategy.
   * - `fluid`: keep own aspect ratio, variable height
   * - `contain`: keep container height, display full image
   * - `cover`: keep container height, cover whole container
   */
  layout?: 'fluid' | 'contain' | 'cover';

  /**
   * A set of alternative image source the browser can choose from.
   */
  srcSet?: Array<ImageSource>;

  /**
   * Size definitions for different viewports to hint the browser which
   * image to choose.
   */
  sizes?: Array<ImageSize>;

  /**
   * Additional source sets for alternative image displays.
   */
  sources?: Array<ImageSourceSet>;

  /**
   * The images intrinsic width.
   */
  width: number;

  /**
   * The images intrinsic height.
   */
  height: number;

  /**
   * CSS classes that will be applied to the <picture> element.
   */
  className?: string;

  /**
   * CSS classes that will be applied to the <picture> element
   * while the image is loading.
   */
  loadingClassName?: string;

  /**
   * CSS classes that will be applied to the <picture> element
   * when the image has been loaded.
   */
  readyClassName?: string;

  /**
   * CSS classes that will be applied to the <picture> element
   * when the image could not be loaded.
   */
  errorClassName?: string;

  /**
   * Picture renderer.
   *
   * Defaults to `picture`, but allows to use a different renderer
   * for testing loading events.
   */
  Picture?: typeof RealPicture;
}>;

type ImageContext = {
  state: 'loading' | 'ready' | 'error';
  props: ImageProps;
};

const ImageContext = createContext<ImageContext>({
  state: 'loading',
  props: {
    src: '',
    height: 0,
    width: 0,
    alt: '',
  },
});

/**
 * Retrieve the current image context. To be used
 * within a custom placeholder only.
 */
export function useImageContext(): ImageContext {
  return useContext(ImageContext);
}

const DefaultImageFallback = () => {
  const { props } = useImageContext();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <div style={{ textAlign: 'center', width: '100%' }}>{props.alt}</div>
    </div>
  );
};

export function Image({
  className,
  loadingClassName,
  errorClassName,
  readyClassName,
  alt,
  children,
  sizes,
  srcSet,
  sources,
  layout = 'fluid',
  lazy = true,
  Picture = RealPicture,
  ...props
}: ImageProps) {
  // The image starts in "ready" state for server side rendering.
  const [state, setState] = useState<ImageContext['state']>('ready');

  // In the browser, initiate the state to "loading".
  useEffect(() => {
    setState('loading');
  }, [setState]);

  return (
    <div
      style={
        layout === 'fluid'
          ? {
              position: 'relative',
              paddingBottom: `${(props.height * 100) / props.width}%`,
            }
          : {
              position: 'relative',
              height: '100%',
            }
      }
    >
      {state !== 'ready' ? (
        <div style={{ position: 'absolute', inset: 0 }} aria-hidden={true}>
          <ImageContext.Provider
            value={{
              state,
              props: { alt, ...props },
            }}
          >
            {children ? children : <DefaultImageFallback />}
          </ImageContext.Provider>
        </div>
      ) : null}
      <Picture
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
      >
        {sources?.map(({ media, srcSet }) => (
          <source
            key={media}
            media={media}
            srcSet={srcSet.map(([src, width]) => `${src} ${width}w`).join(', ')}
            sizes={sizes
              ?.map((size) => {
                return typeof size === 'string' ? [undefined, size] : size;
              })
              .map(([media, size]) => (media ? `${media} ${size}` : size))
              .join(', ')}
          />
        ))}
        {srcSet ? (
          <source
            srcSet={srcSet.map(([src, width]) => `${src} ${width}w`).join(', ')}
            sizes={sizes
              ?.map((size) => {
                return typeof size === 'string' ? [undefined, size] : size;
              })
              .map(([media, size]) => (media ? `${media} ${size}` : size))
              .join(', ')}
          />
        ) : undefined}
        <img
          loading={lazy ? 'lazy' : 'eager'}
          alt={alt}
          {...props}
          style={
            layout === 'fluid' ? {} : { objectFit: layout, height: '100%' }
          }
          className={clsx(className, {
            [readyClassName || '']: state === 'ready',
            [loadingClassName || '']: state === 'loading',
            [errorClassName || '']: state === 'error',
          })}
        />
      </Picture>
    </div>
  );
}
