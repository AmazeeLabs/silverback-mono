type ImageProps = {
  src: string;
  alt: string;
};

export function Image({ src, alt }: ImageProps) {
  return (
    <img src={src} alt={alt} style={{ maxWidth: '100%', display: 'block' }} />
  );
}
